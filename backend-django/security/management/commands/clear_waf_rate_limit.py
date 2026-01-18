"""
Management command to clear WAF rate limit cache
Useful when rate limiting blocks legitimate requests during development
"""
from django.core.management.base import BaseCommand
from django.core.cache import cache
import re


class Command(BaseCommand):
    help = 'Clear WAF rate limit cache for all IPs or a specific IP'

    def add_arguments(self, parser):
        parser.add_argument(
            '--ip',
            type=str,
            help='Clear rate limit for a specific IP address (e.g., 127.0.0.1)',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Clear rate limit for all IPs (use with caution)',
        )

    def handle(self, *args, **options):
        if options['ip']:
            # Clear for specific IP
            ip = options['ip']
            minute_key = f"waf_rate_limit_minute:{ip}"
            hour_key = f"waf_rate_limit_hour:{ip}"
            
            cache.delete(minute_key)
            cache.delete(hour_key)
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Rate limit cache cleared for IP: {ip}')
            )
        elif options['all']:
            # Clear all rate limit keys (requires Redis or cache backend that supports pattern matching)
            # This is a simple implementation - for production, you might want to use Redis SCAN
            self.stdout.write(
                self.style.WARNING('⚠️  Clearing all rate limit cache...')
            )
            
            # Note: This is a simple approach. For Redis, you'd use SCAN with pattern matching
            # For now, we'll just clear common localhost IPs
            common_ips = ['127.0.0.1', '::1', 'localhost']
            cleared_count = 0
            
            for ip in common_ips:
                minute_key = f"waf_rate_limit_minute:{ip}"
                hour_key = f"waf_rate_limit_hour:{ip}"
                if cache.delete(minute_key) or cache.delete(hour_key):
                    cleared_count += 1
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Cleared rate limit cache for {cleared_count} common IPs')
            )
            self.stdout.write(
                self.style.WARNING('Note: For other IPs, use --ip option or restart Redis/cache server')
            )
        else:
            # Default: clear for localhost
            localhost_ips = ['127.0.0.1', '::1']
            for ip in localhost_ips:
                minute_key = f"waf_rate_limit_minute:{ip}"
                hour_key = f"waf_rate_limit_hour:{ip}"
                cache.delete(minute_key)
                cache.delete(hour_key)
            
            self.stdout.write(
                self.style.SUCCESS('✅ Rate limit cache cleared for localhost (127.0.0.1, ::1)')
            )
            self.stdout.write(
                self.style.WARNING('Use --ip <IP> to clear for a specific IP, or --all to clear all')
            )

