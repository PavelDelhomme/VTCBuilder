"""
Views for Security management
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from .models import WAFRule, WAFLog, SecurityAlert, FirewallRule, SecuritySettings
from .serializers import (
    WAFRuleSerializer, WAFLogSerializer, SecurityAlertSerializer,
    FirewallRuleSerializer, SecuritySettingsSerializer
)
from api.utils import add_cors_headers


class WAFRuleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing WAF Rules"""
    queryset = WAFRule.objects.all()
    serializer_class = WAFRuleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return WAFRule.objects.all().order_by('priority', '-created_at')
    
    def list(self, request, *args, **kwargs):
        try:
            response = super().list(request, *args, **kwargs)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            add_cors_headers(response, request)
            return response
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(created_by=request.user)
            response = Response(serializer.data, status=status.HTTP_201_CREATED)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(response, request)
            return response
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle rule status"""
        try:
            rule = self.get_object()
            rule.status = 'inactive' if rule.status == 'active' else 'active'
            rule.save()
            serializer = self.get_serializer(rule)
            response = Response(serializer.data)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(response, request)
            return response
    
    @action(detail=False, methods=['post'])
    def init_default_rules(self, request):
        """Initialize default WAF rules"""
        try:
            from django.core.management import call_command
            from io import StringIO
            import sys
            
            # Capture output
            out = StringIO()
            old_stdout = sys.stdout
            sys.stdout = out
            
            try:
                call_command('init_default_waf_rules', force=request.data.get('force', False))
                output = out.getvalue()
            finally:
                sys.stdout = old_stdout
            
            # Reload rules
            rules = WAFRule.objects.filter(name__startswith='[Défaut]')
            serializer = self.get_serializer(rules, many=True)
            
            response = Response({
                'message': 'Règles par défaut initialisées avec succès',
                'rules': serializer.data,
                'count': rules.count()
            }, status=status.HTTP_201_CREATED)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            add_cors_headers(response, request)
            return response


class WAFLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing WAF Logs"""
    queryset = WAFLog.objects.all()
    serializer_class = WAFLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = WAFLog.objects.all()
        
        # Filters
        ip_address = self.request.query_params.get('ip_address')
        if ip_address:
            queryset = queryset.filter(ip_address=ip_address)
        
        severity = self.request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)
        
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)
        
        # Date range
        days = self.request.query_params.get('days', 7)
        try:
            days = int(days)
            since = timezone.now() - timedelta(days=days)
            queryset = queryset.filter(timestamp__gte=since)
        except ValueError:
            pass
        
        return queryset.order_by('-timestamp')
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get WAF statistics"""
        try:
            days = int(request.query_params.get('days', 7))
            since = timezone.now() - timedelta(days=days)
            
            logs = WAFLog.objects.filter(timestamp__gte=since)
            
            # Calculate threats by type (from matched_rule.rule_type)
            threats_by_type = {}
            blocked_logs = logs.filter(action='blocked')
            for log in blocked_logs.select_related('matched_rule'):
                if log.matched_rule:
                    rule_type = log.matched_rule.rule_type
                    threats_by_type[rule_type] = threats_by_type.get(rule_type, 0) + 1
            
            # Top threatening IPs (only blocked requests)
            top_threatening_ips = [
                {'ip_address': item['ip_address'], 'count': item['count']}
                for item in blocked_logs.values('ip_address').annotate(count=Count('id')).order_by('-count')[:10]
            ]
            
            stats = {
                'total_requests': logs.count(),
                'blocked': logs.filter(action='blocked').count(),
                'allowed': logs.filter(action='allowed').count(),
                'total_threats_detected': blocked_logs.count(),
                'blocked_ips': blocked_logs.values('ip_address').distinct().count(),
                'threats_by_type': threats_by_type,
                'top_threatening_ips': top_threatening_ips,
                'by_severity': list(logs.values('severity').annotate(count=Count('id'))),
                'by_action': list(logs.values('action').annotate(count=Count('id'))),
                'top_ips': list(logs.values('ip_address').annotate(count=Count('id')).order_by('-count')[:10]),
                'top_paths': list(logs.values('request_path').annotate(count=Count('id')).order_by('-count')[:10]),
            }
            
            response = Response(stats)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(response, request)
            return response


class SecurityAlertViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Security Alerts"""
    queryset = SecurityAlert.objects.all()
    serializer_class = SecurityAlertSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = SecurityAlert.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by severity
        severity = self.request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Acknowledge an alert"""
        try:
            alert = self.get_object()
            alert.status = 'acknowledged'
            alert.acknowledged_at = timezone.now()
            alert.acknowledged_by = request.user
            alert.save()
            serializer = self.get_serializer(alert)
            response = Response(serializer.data)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(response, request)
            return response
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve an alert"""
        try:
            alert = self.get_object()
            alert.status = 'resolved'
            alert.resolved_at = timezone.now()
            alert.save()
            serializer = self.get_serializer(alert)
            response = Response(serializer.data)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(response, request)
            return response


class FirewallRuleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Firewall Rules"""
    queryset = FirewallRule.objects.all()
    serializer_class = FirewallRuleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return FirewallRule.objects.all().order_by('priority', '-created_at')
    
    def list(self, request, *args, **kwargs):
        try:
            response = super().list(request, *args, **kwargs)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            add_cors_headers(response, request)
            return response
    
    @action(detail=False, methods=['post'])
    def init_default_rules(self, request):
        """Initialize default Firewall rules"""
        try:
            from django.core.management import call_command
            from io import StringIO
            import sys
            
            # Capture output
            out = StringIO()
            old_stdout = sys.stdout
            sys.stdout = out
            
            try:
                call_command('init_default_firewall_rules', force=request.data.get('force', False))
                output = out.getvalue()
            finally:
                sys.stdout = old_stdout
            
            # Reload rules
            rules = FirewallRule.objects.filter(name__startswith='[Défaut]')
            serializer = self.get_serializer(rules, many=True)
            
            response = Response({
                'message': 'Règles Firewall par défaut initialisées avec succès',
                'rules': serializer.data,
                'count': rules.count()
            }, status=status.HTTP_201_CREATED)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            add_cors_headers(response, request)
            return response


class SecuritySettingsViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Security Settings"""
    queryset = SecuritySettings.objects.all()
    serializer_class = SecuritySettingsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Return singleton
        settings, _ = SecuritySettings.objects.get_or_create()
        return SecuritySettings.objects.filter(pk=settings.pk)
    
    def list(self, request, *args, **kwargs):
        try:
            settings, _ = SecuritySettings.objects.get_or_create()
            serializer = self.get_serializer(settings)
            response = Response(serializer.data)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            add_cors_headers(response, request)
            return response
    
    def update(self, request, *args, **kwargs):
        try:
            settings, _ = SecuritySettings.objects.get_or_create()
            serializer = self.get_serializer(settings, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save(updated_by=request.user)
            response = Response(serializer.data)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(response, request)
            return response

