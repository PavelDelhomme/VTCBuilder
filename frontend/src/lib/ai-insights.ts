/**
 * IA Maison - Génération d'insights automatiques basés sur les données analytics
 * Pas d'API externe, tout est fait localement avec des algorithmes simples
 */

import { UsageStats } from '@/services/analytics.service'

export interface Insight {
  type: 'trend' | 'recommendation' | 'anomaly' | 'opportunity' | 'warning'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  category: string
  data?: any
  action?: string
}

export interface BehavioralPattern {
  pattern: string
  description: string
  confidence: number
  users_affected?: number
  recommendation?: string
}

/**
 * Analyse les données et génère des insights automatiques
 */
export function generateInsights(usageStats: UsageStats | null): Insight[] {
  if (!usageStats || !usageStats.summary) {
    return []
  }

  const insights: Insight[] = []
  const summary = usageStats.summary

  // 1. Analyse des tendances temporelles
  if (usageStats.actions_timeline && usageStats.actions_timeline.length >= 7) {
    const recent = usageStats.actions_timeline.slice(-7)
    const previous = usageStats.actions_timeline.slice(-14, -7)
    
    const recentAvg = recent.reduce((sum, d) => sum + d.count, 0) / recent.length
    const previousAvg = previous.reduce((sum, d) => sum + d.count, 0) / previous.length
    
    if (recentAvg > previousAvg * 1.2) {
      insights.push({
        type: 'trend',
        severity: 'high',
        title: '📈 Croissance significative',
        description: `Les actions utilisateurs ont augmenté de ${Math.round(((recentAvg - previousAvg) / previousAvg) * 100)}% cette semaine. Excellente tendance !`,
        category: 'Engagement',
        data: { recentAvg, previousAvg, growth: ((recentAvg - previousAvg) / previousAvg) * 100 }
      })
    } else if (recentAvg < previousAvg * 0.8) {
      insights.push({
        type: 'warning',
        severity: 'medium',
        title: '⚠️ Baisse d\'activité',
        description: `Les actions utilisateurs ont diminué de ${Math.round(((previousAvg - recentAvg) / previousAvg) * 100)}% cette semaine. À surveiller.`,
        category: 'Engagement',
        data: { recentAvg, previousAvg, decline: ((previousAvg - recentAvg) / previousAvg) * 100 }
      })
    }
  }

  // 2. Analyse des CTAs les plus performants
  if (usageStats.most_clicked_ctas && usageStats.most_clicked_ctas.length > 0) {
    const topCta = usageStats.most_clicked_ctas[0]
    const totalCtaClicks = usageStats.most_clicked_ctas.reduce((sum, cta) => sum + cta.count, 0)
    
    if (topCta.count > totalCtaClicks * 0.3) {
      insights.push({
        type: 'opportunity',
        severity: 'high',
        title: '🎯 CTA très performant',
        description: `Le CTA "${topCta.action_name}" représente ${Math.round((topCta.count / totalCtaClicks) * 100)}% de tous les clics. Pensez à créer des variantes similaires.`,
        category: 'Conversion',
        data: { cta: topCta, percentage: (topCta.count / totalCtaClicks) * 100 }
      })
    }
  }

  // 3. Analyse de l'utilisation de la documentation
  if (usageStats.docs_stats) {
    const docsViews = usageStats.docs_stats.total_views
    const totalPageViews = usageStats.public_site_stats?.page_views || 0
    
    if (totalPageViews > 0) {
      const docsPercentage = (docsViews / totalPageViews) * 100
      
      if (docsPercentage < 5) {
        insights.push({
          type: 'recommendation',
          severity: 'medium',
          title: '📚 Documentation sous-utilisée',
          description: `Seulement ${docsPercentage.toFixed(1)}% des visites concernent la documentation. Pensez à mieux la promouvoir.`,
          category: 'Documentation',
          data: { docsPercentage, docsViews, totalPageViews }
        })
      } else if (docsPercentage > 20) {
        insights.push({
          type: 'trend',
          severity: 'low',
          title: '✅ Documentation très consultée',
          description: `${docsPercentage.toFixed(1)}% des visites concernent la documentation. Les utilisateurs s'informent activement !`,
          category: 'Documentation',
          data: { docsPercentage }
        })
      }
    }
  }

  // 4. Analyse des patterns horaires
  if (usageStats.actions_by_hour && usageStats.actions_by_hour.length > 0) {
    const peakHour = usageStats.actions_by_hour.reduce((max, hour) => 
      hour.count > max.count ? hour : max
    )
    const avgHourly = usageStats.actions_by_hour.reduce((sum, h) => sum + h.count, 0) / 24
    
    if (peakHour.count > avgHourly * 2) {
      insights.push({
        type: 'trend',
        severity: 'low',
        title: '⏰ Pic d\'activité identifié',
        description: `L'activité est maximale à ${peakHour.label} (${peakHour.count} actions vs ${Math.round(avgHourly)} en moyenne). Idéal pour les communications ciblées.`,
        category: 'Temporalité',
        data: { peakHour, avgHourly }
      })
    }
  }

  // 5. Analyse des utilisateurs anonymes vs authentifiés
  if (usageStats.user_type_stats) {
    const { anonymous, authenticated } = usageStats.user_type_stats
    const total = anonymous + authenticated
    
    if (total > 0) {
      const anonymousPercentage = (anonymous / total) * 100
      
      if (anonymousPercentage > 70) {
        insights.push({
          type: 'recommendation',
          severity: 'high',
          title: '👤 Beaucoup d\'utilisateurs anonymes',
          description: `${anonymousPercentage.toFixed(1)}% des actions proviennent d'utilisateurs anonymes. Pensez à améliorer l'incitation à la création de compte.`,
          category: 'Conversion',
          data: { anonymousPercentage, anonymous, authenticated }
        })
      }
    }
  }

  // 6. Analyse des fonctionnalités les plus utilisées
  if (usageStats.feature_usage_stats && usageStats.feature_usage_stats.length > 0) {
    const topFeature = usageStats.feature_usage_stats[0]
    const totalFeatures = usageStats.feature_usage_stats.length
    
    if (topFeature.total_usage > 100 && topFeature.tenant_count < totalFeatures * 0.3) {
      insights.push({
        type: 'opportunity',
        severity: 'medium',
        title: '🚀 Fonctionnalité populaire',
        description: `La fonctionnalité "${topFeature.feature_name}" est très utilisée mais seulement par ${topFeature.tenant_count} tenants. Pensez à la promouvoir davantage.`,
        category: 'Fonctionnalités',
        data: { feature: topFeature }
      })
    }
  }

  // 7. Analyse des liens les plus cliqués
  if (usageStats.top_links && usageStats.top_links.length > 0) {
    const externalLinks = usageStats.top_links.filter(link => {
      const url = link['metadata__url'] || ''
      if (typeof window === 'undefined') return false
      return url.startsWith('http') && !url.includes(window.location.hostname)
    })
    
    if (externalLinks.length > usageStats.top_links.length * 0.5) {
      insights.push({
        type: 'warning',
        severity: 'medium',
        title: '🔗 Beaucoup de liens externes',
        description: `${externalLinks.length} des ${usageStats.top_links.length} liens les plus cliqués sont externes. Cela peut réduire le temps passé sur votre site.`,
        category: 'Engagement',
        data: { externalLinks: externalLinks.length, totalLinks: usageStats.top_links.length }
      })
    }
  }

  // 8. Analyse de l'activité par tenant
  if (usageStats.actions_by_tenant && usageStats.actions_by_tenant.length > 0) {
    const activeTenants = usageStats.actions_by_tenant.filter(t => t.total_actions > 10).length
    const totalTenants = usageStats.actions_by_tenant.length
    
    if (activeTenants < totalTenants * 0.3) {
      insights.push({
        type: 'recommendation',
        severity: 'high',
        title: '💼 Faible engagement des tenants',
        description: `Seulement ${activeTenants} sur ${totalTenants} tenants sont actifs. Pensez à relancer les tenants inactifs.`,
        category: 'Engagement',
        data: { activeTenants, totalTenants }
      })
    }
  }

  // 9. Analyse des pages les plus visitées
  if (usageStats.most_viewed_pages && usageStats.most_viewed_pages.length > 0) {
    const topPage = usageStats.most_viewed_pages[0]
    const totalPageViews = usageStats.most_viewed_pages.reduce((sum, p) => sum + p.count, 0)
    
    if (topPage.count > totalPageViews * 0.4) {
      insights.push({
        type: 'trend',
        severity: 'low',
        title: '📄 Page très populaire',
        description: `Une page représente ${Math.round((topPage.count / totalPageViews) * 100)}% des visites. C'est votre point d'entrée principal.`,
        category: 'Navigation',
        data: { page: topPage, percentage: (topPage.count / totalPageViews) * 100 }
      })
    }
  }

  // 10. Analyse des patterns de jour de la semaine
  if (usageStats.actions_by_day_of_week && usageStats.actions_by_day_of_week.length > 0) {
    const weekdays = usageStats.actions_by_day_of_week.slice(0, 5)
    const weekends = usageStats.actions_by_day_of_week.slice(5)
    
    const weekdayAvg = weekdays.reduce((sum, d) => sum + d.count, 0) / weekdays.length
    const weekendAvg = weekends.reduce((sum, d) => sum + d.count, 0) / weekends.length
    
    if (weekdayAvg > weekendAvg * 2) {
      insights.push({
        type: 'trend',
        severity: 'low',
        title: '📅 Activité concentrée en semaine',
        description: `L'activité est ${Math.round((weekdayAvg / weekendAvg))}x plus élevée en semaine qu'en weekend. Comportement professionnel typique.`,
        category: 'Temporalité',
        data: { weekdayAvg, weekendAvg }
      })
    }
  }

  return insights.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
}

/**
 * Détecte des patterns comportementaux
 */
export function detectBehavioralPatterns(usageStats: UsageStats | null): BehavioralPattern[] {
  if (!usageStats) return []

  const patterns: BehavioralPattern[] = []

  // Pattern 1: Utilisateurs qui créent beaucoup de contenu
  if (usageStats.actions_by_user) {
    const contentCreators = usageStats.actions_by_user.filter(u => u.page_creates > 5 || u.block_actions > 20)
    if (contentCreators.length > 0) {
      patterns.push({
        pattern: 'Créateurs de contenu actifs',
        description: `${contentCreators.length} utilisateur(s) créent régulièrement du contenu (pages/blocs)`,
        confidence: 0.8,
        users_affected: contentCreators.length,
        recommendation: 'Ces utilisateurs pourraient bénéficier de fonctionnalités avancées ou de formations'
      })
    }
  }

  // Pattern 2: Utilisateurs qui naviguent beaucoup mais ne créent pas
  if (usageStats.actions_by_user) {
    const browsers = usageStats.actions_by_user.filter(u => 
      u.page_views > 20 && u.page_creates === 0 && u.block_actions === 0
    )
    if (browsers.length > 0) {
      patterns.push({
        pattern: 'Utilisateurs en mode consultation',
        description: `${browsers.length} utilisateur(s) consultent beaucoup mais ne créent pas de contenu`,
        confidence: 0.7,
        users_affected: browsers.length,
        recommendation: 'Ces utilisateurs pourraient avoir besoin d\'aide pour commencer à créer'
      })
    }
  }

  // Pattern 3: Tenants avec forte activité mais peu d'utilisateurs
  if (usageStats.actions_by_tenant) {
    const concentratedTenants = usageStats.actions_by_tenant.filter(t => 
      t.total_actions > 50 && t.unique_users < 3
    )
    if (concentratedTenants.length > 0) {
      patterns.push({
        pattern: 'Tenants à activité concentrée',
        description: `${concentratedTenants.length} tenant(s) ont une forte activité avec peu d'utilisateurs`,
        confidence: 0.75,
        recommendation: 'Ces tenants pourraient bénéficier d\'une formation pour leurs équipes'
      })
    }
  }

  return patterns
}


