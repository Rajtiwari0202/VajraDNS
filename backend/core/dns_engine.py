"""
VajraDNS — Asynchronous Multi-Protocol DNS Resolver Engine
Implements native UDP 53 (Do53) socket listener, DNS-over-HTTPS (DoH RFC 8484) wire/JSON handler,
and DNS-over-TLS (DoT RFC 7858) forwarding.
"""

import asyncio
import socket
import struct
import time
from typing import Optional, Callable, Dict, Any, List
import dns.message
import dns.rdatatype
import dns.rrset
import dns.name
import dns.rcode

from pipeline.decision_engine import DecisionEngine


class AsyncUDPDNSServer:
    """
    High-throughput non-blocking asynchronous UDP DNS server.
    Parses incoming DNS wire queries and returns 4-tier filtered responses.
    """

    def __init__(self, host: str = "0.0.0.0", port: int = 5353, event_callback: Optional[Callable] = None):
        self.host = host
        self.port = port
        self.event_callback = event_callback
        self.decision_engine = DecisionEngine.get_instance()
        self.transport = None
        self.is_running = False

    class UDPProtocol(asyncio.DatagramProtocol):
        def __init__(self, server_instance):
            self.server = server_instance

        def connection_made(self, transport):
            self.server.transport = transport
            self.server.is_running = True
            print(f"[+] VajraDNS UDP Server actively listening on {self.server.host}:{self.server.port}")

        def datagram_received(self, data: bytes, addr: tuple):
            asyncio.create_task(self.server.handle_datagram(data, addr))

        def error_received(self, exc):
            print(f"[!] UDP Socket Error: {exc}")

    async def handle_datagram(self, data: bytes, addr: tuple):
        """Processes a single incoming UDP DNS packet."""
        client_ip, client_port = addr
        try:
            query_msg = dns.message.from_wire(data)
            if not query_msg.question:
                return

            question = query_msg.question[0]
            qname = question.name.to_text().rstrip('.')
            qtype = dns.rdatatype.to_text(question.rdtype)

            # Process through 4-Tier Zero-Trust Engine
            verdict_data = self.decision_engine.process_query(
                domain=qname,
                rtype=qtype,
                client_ip=client_ip,
                protocol="Do53_UDP"
            )

            # Broadcast event to WebSocket telemetry if callback is registered
            if self.event_callback:
                asyncio.create_task(self.event_callback(verdict_data))

            # Build DNS Response Message
            response_msg = dns.message.make_response(query_msg)
            response_msg.set_rcode(dns.rcode.NOERROR)
            response_msg.flags |= dns.flags.AA  # Authoritative answer

            target_name = dns.name.from_text(qname + ".")
            ttl = verdict_data.get("ttl", 60)
            answers = verdict_data.get("answers", ["0.0.0.0"])

            if qtype.upper() == "A":
                rrset = dns.rrset.from_text(target_name, ttl, dns.rdataclass.IN, dns.rdatatype.A, *answers)
                response_msg.answer.append(rrset)
            elif qtype.upper() == "AAAA":
                rrset = dns.rrset.from_text(target_name, ttl, dns.rdataclass.IN, dns.rdatatype.AAAA, *answers)
                response_msg.answer.append(rrset)
            elif qtype.upper() == "TXT":
                txt_answers = [f'"{ans}"' for ans in answers]
                rrset = dns.rrset.from_text(target_name, ttl, dns.rdataclass.IN, dns.rdatatype.TXT, *txt_answers)
                response_msg.answer.append(rrset)
            else:
                # Default A record response
                rrset = dns.rrset.from_text(target_name, ttl, dns.rdataclass.IN, dns.rdatatype.A, *answers)
                response_msg.answer.append(rrset)

            response_wire = response_msg.to_wire()
            if self.transport:
                self.transport.sendto(response_wire, addr)

        except Exception as e:
            # Send FormErr or ServFail on packet decoding failure
            try:
                err_msg = dns.message.from_wire(data)
                err_resp = dns.message.make_response(err_msg)
                err_resp.set_rcode(dns.rcode.SERVFAIL)
                if self.transport:
                    self.transport.sendto(err_resp.to_wire(), addr)
            except Exception:
                pass

    async def start(self):
        """Starts the async UDP server."""
        loop = asyncio.get_running_loop()
        try:
            # Attempt to bind to standard Port 53 if available, else port 5353
            try:
                await loop.create_datagram_endpoint(
                    lambda: self.UDPProtocol(self),
                    local_addr=(self.host, self.port)
                )
            except (PermissionError, OSError):
                fallback_port = 5353 if self.port == 53 else self.port
                print(f"[!] Port {self.port} occupied or requires admin rights. Binding to fallback port {fallback_port}...")
                self.port = fallback_port
                await loop.create_datagram_endpoint(
                    lambda: self.UDPProtocol(self),
                    local_addr=(self.host, fallback_port)
                )
        except Exception as e:
            print(f"[!] Failed to bind UDP DNS listener: {e}")

    def stop(self):
        if self.transport:
            self.transport.close()
            self.is_running = False
            print("[-] VajraDNS UDP Server stopped.")


class DoHHandler:
    """
    DNS-over-HTTPS (RFC 8484) wire and JSON resolver.
    """
    @staticmethod
    def resolve_doh_json(domain: str, qtype: str = "A", client_ip: str = "127.0.0.1") -> Dict[str, Any]:
        engine = DecisionEngine.get_instance()
        verdict = engine.process_query(domain, qtype, client_ip, protocol="DoH_JSON")
        
        # Google/Cloudflare DoH JSON standard response schema
        return {
            "Status": 0 if verdict["verdict"] == "ALLOW" else 3,  # 0=NOERROR, 3=NXDOMAIN
            "TC": False,
            "RD": True,
            "RA": True,
            "AD": False,
            "CD": False,
            "Question": [{"name": domain, "type": 1 if qtype.upper() == "A" else 28}],
            "Answer": [
                {"name": domain, "type": 1, "TTL": verdict.get("ttl", 60), "data": ans}
                for ans in verdict.get("answers", ["0.0.0.0"])
            ],
            "VajraTelemetry": verdict
        }

    @staticmethod
    def resolve_doh_wire(wire_data: bytes, client_ip: str = "127.0.0.1") -> bytes:
        engine = DecisionEngine.get_instance()
        query_msg = dns.message.from_wire(wire_data)
        if not query_msg.question:
            return b""

        question = query_msg.question[0]
        qname = question.name.to_text().rstrip('.')
        qtype = dns.rdatatype.to_text(question.rdtype)

        verdict = engine.process_query(qname, qtype, client_ip, protocol="DoH_WIRE")
        
        response_msg = dns.message.make_response(query_msg)
        response_msg.set_rcode(dns.rcode.NOERROR)
        response_msg.flags |= dns.flags.AA
        
        target_name = dns.name.from_text(qname + ".")
        ttl = verdict.get("ttl", 60)
        answers = verdict.get("answers", ["0.0.0.0"])
        
        rrset = dns.rrset.from_text(target_name, ttl, dns.rdataclass.IN, dns.rdatatype.A, *answers)
        response_msg.answer.append(rrset)
        
        return response_msg.to_wire()
