#!/usr/bin/env python3
"""
Script pour comparer les performances avant/après optimisations
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime

REPORT_DIR = Path("./performance_reports")

def parse_memory(mem_str):
    """Parse memory string like '512MiB / 1GiB' to MB"""
    try:
        if '/' in mem_str:
            used = mem_str.split('/')[0].strip()
        else:
            used = mem_str.strip()
        
        value = float(used.replace('MiB', '').replace('GiB', '').replace('KiB', '').strip())
        if 'GiB' in used:
            return value * 1024
        elif 'MiB' in used:
            return value
        elif 'KiB' in used:
            return value / 1024
        return value
    except:
        return 0

def parse_cpu(cpu_str):
    """Parse CPU percentage string"""
    try:
        return float(cpu_str.replace('%', '').strip())
    except:
        return 0

def load_reports():
    """Load all performance reports"""
    reports = []
    if not REPORT_DIR.exists():
        return reports
    
    for report_file in sorted(REPORT_DIR.glob("performance_*.json")):
        try:
            with open(report_file, 'r') as f:
                data = json.load(f)
                reports.append(data)
        except Exception as e:
            print(f"⚠️  Erreur lecture {report_file}: {e}")
    
    return reports

def compare_reports(reports):
    """Compare reports and show improvements"""
    if len(reports) < 2:
        print("❌ Pas assez de rapports pour comparer (minimum 2)")
        return
    
    # Trier par timestamp
    reports.sort(key=lambda x: x.get('timestamp', ''))
    
    baseline = reports[0]
    latest = reports[-1]
    
    print("=" * 60)
    print("📊 COMPARAISON DES PERFORMANCES")
    print("=" * 60)
    print(f"\n📅 Baseline: {baseline.get('date', 'N/A')}")
    print(f"📅 Dernier:  {latest.get('date', 'N/A')}")
    print()
    
    # Comparer la mémoire totale
    baseline_mem = float(baseline.get('totals', {}).get('memory_mb', 0))
    latest_mem = float(latest.get('totals', {}).get('memory_mb', 0))
    
    if baseline_mem > 0:
        mem_reduction = ((baseline_mem - latest_mem) / baseline_mem) * 100
        print(f"💾 MÉMOIRE:")
        print(f"   Avant:  {baseline_mem:.2f} MB")
        print(f"   Après: {latest_mem:.2f} MB")
        print(f"   Réduction: {mem_reduction:.1f}%")
        if mem_reduction >= 50:
            print(f"   ✅ Objectif atteint (≥50%)")
        elif mem_reduction >= 25:
            print(f"   ⚠️  Objectif partiel (≥25%)")
        else:
            print(f"   ❌ Objectif non atteint (<25%)")
        print()
    
    # Comparer le CPU
    baseline_cpu = float(baseline.get('totals', {}).get('cpu_percent', 0))
    latest_cpu = float(latest.get('totals', {}).get('cpu_percent', 0))
    
    if baseline_cpu > 0:
        cpu_reduction = ((baseline_cpu - latest_cpu) / baseline_cpu) * 100
        print(f"⚡ CPU:")
        print(f"   Avant:  {baseline_cpu:.2f}%")
        print(f"   Après: {latest_cpu:.2f}%")
        print(f"   Réduction: {cpu_reduction:.1f}%")
        print()
    
    # Comparer par conteneur
    print("📦 PAR CONTENEUR:")
    for container in ['backend', 'frontend', 'postgres', 'redis']:
        baseline_container = baseline.get('containers', {}).get(container, '')
        latest_container = latest.get('containers', {}).get(container, '')
        
        if baseline_container and latest_container and baseline_container != 'N/A':
            baseline_parts = baseline_container.split(',')
            latest_parts = latest_container.split(',')
            
            if len(baseline_parts) >= 4 and len(latest_parts) >= 4:
                baseline_mem_usage = baseline_parts[2] if len(baseline_parts) > 2 else '0 MiB'
                latest_mem_usage = latest_parts[2] if len(latest_parts) > 2 else '0 MiB'
                
                baseline_mem_mb = parse_memory(baseline_mem_usage)
                latest_mem_mb = parse_memory(latest_mem_usage)
                
                if baseline_mem_mb > 0:
                    reduction = ((baseline_mem_mb - latest_mem_mb) / baseline_mem_mb) * 100
                    print(f"   {container}:")
                    print(f"      Avant:  {baseline_mem_usage}")
                    print(f"      Après: {latest_mem_usage}")
                    print(f"      Réduction: {reduction:.1f}%")
    
    print()
    print("=" * 60)

if __name__ == "__main__":
    reports = load_reports()
    
    if not reports:
        print("❌ Aucun rapport de performance trouvé")
        print(f"   Exécutez d'abord: ./scripts/monitor_performance.sh")
        sys.exit(1)
    
    compare_reports(reports)

