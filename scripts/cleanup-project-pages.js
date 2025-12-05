/**
 * Script pour nettoyer les pages d'un projet
 * Garde uniquement les pages spécifiées (home et test par défaut)
 * 
 * Usage: node scripts/cleanup-project-pages.js [projectId] [page1] [page2] ...
 * Exemple: node scripts/cleanup-project-pages.js 1 home test
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api';
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''; // À définir

async function cleanupProjectPages(projectId, keepSlugs = ['home', 'test']) {
  try {
    console.log(`📁 Nettoyage du projet ID: ${projectId}`);
    console.log(`✅ Pages à conserver: ${keepSlugs.join(', ')}`);
    
    // 1. Récupérer le projet
    const projectResponse = await axios.get(`${API_BASE_URL}/projects/${projectId}/`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const project = projectResponse.data;
    console.log(`📁 Projet: ${project.name}`);
    
    if (!project.pages || project.pages.length === 0) {
      console.log('✅ Aucune page dans le projet');
      return;
    }
    
    console.log(`📄 Total de pages: ${project.pages.length}`);
    
    // 2. Identifier les pages à retirer
    const pagesToRemove = project.pages.filter(
      page => !keepSlugs.includes(page.page_slug)
    );
    
    const pagesToKeep = project.pages.filter(
      page => keepSlugs.includes(page.page_slug)
    );
    
    console.log(`\n✅ Pages à conserver (${pagesToKeep.length}):`);
    pagesToKeep.forEach(page => {
      console.log(`   - ${page.page_slug} (ID: ${page.id})`);
    });
    
    console.log(`\n🗑️  Pages à retirer (${pagesToRemove.length}):`);
    pagesToRemove.forEach(page => {
      console.log(`   - ${page.page_slug} (ID: ${page.id})`);
    });
    
    if (pagesToRemove.length === 0) {
      console.log('\n✅ Aucune page à retirer. Le projet contient déjà uniquement les pages souhaitées.');
      return;
    }
    
    // 3. Retirer les pages
    console.log('\n🗑️  Retrait des pages...');
    for (const page of pagesToRemove) {
      try {
        await axios.delete(`${API_BASE_URL}/projects/${projectId}/remove_page/`, {
          headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          },
          data: {
            page_id: page.id
          }
        });
        console.log(`   ✅ Page "${page.page_slug}" retirée`);
      } catch (error) {
        console.error(`   ❌ Erreur lors du retrait de "${page.page_slug}":`, error.response?.data || error.message);
      }
    }
    
    console.log(`\n✅ Nettoyage terminé ! ${pagesToRemove.length} page(s) retirée(s)`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Récupérer les arguments
const args = process.argv.slice(2);
const projectId = parseInt(args[0]) || 1;
const keepSlugs = args.slice(1).length > 0 ? args.slice(1) : ['home', 'test'];

if (!AUTH_TOKEN) {
  console.error('❌ AUTH_TOKEN non défini. Définissez-le dans les variables d\'environnement.');
  console.log('   Exemple: export AUTH_TOKEN="votre_token"');
  process.exit(1);
}

cleanupProjectPages(projectId, keepSlugs);

