import puppeteer from 'puppeteer';

/**
 * Script de debug pour analyser la structure de metatft.com
 */
async function debugMetaTFT(): Promise<void> {
  console.log('🔍 Analyse de la structure de metatft.com...');
  
  const browser = await puppeteer.launch({
    headless: false, // Mode visible pour debug
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    console.log('📄 Navigation vers metatft.com/comps...');
    await page.goto('https://metatft.com/comps', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Attendre que la page soit chargée
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Analyser le contenu HTML
    const pageContent = await page.evaluate(() => {
      console.log('Document ready state:', document.readyState);
      console.log('Page title:', document.title);
      
      // Chercher tous les liens
      const allLinks = Array.from(document.querySelectorAll('a')).map(a => ({
        href: a.href,
        text: a.textContent?.trim() || '',
        classes: a.className
      }));

      // Chercher des éléments qui pourraient être des compositions
      const possibleCompositions = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent?.toLowerCase() || '';
        const className = typeof el.className === 'string' ? el.className.toLowerCase() : '';
        return text.includes('comp') || className.includes('comp') || 
               text.includes('team') || className.includes('team') ||
               text.includes('build') || className.includes('build');
      }).map(el => ({
        tagName: el.tagName,
        className: typeof el.className === 'string' ? el.className : '',
        textContent: el.textContent?.trim().substring(0, 100) || ''
      }));

      // Chercher des structures de cartes communes
      const cardElements = Array.from(document.querySelectorAll('.card, [class*="card"], .item, [class*="item"], .comp, [class*="comp"]'))
        .map(el => ({
          tagName: el.tagName,
          className: typeof el.className === 'string' ? el.className : '',
          textContent: el.textContent?.trim().substring(0, 100) || ''
        }));

      return {
        title: document.title,
        url: window.location.href,
        allLinks: allLinks.slice(0, 20), // Premier 20 liens
        possibleCompositions: possibleCompositions.slice(0, 10),
        cardElements: cardElements.slice(0, 10),
        bodyHTML: document.body.innerHTML.substring(0, 2000) // Premier 2000 caractères
      };
    });

    console.log('📊 Analyse terminée:');
    console.log('Title:', pageContent.title);
    console.log('URL:', pageContent.url);
    console.log('\n🔗 Liens trouvés:');
    pageContent.allLinks.forEach((link, i) => {
      console.log(`${i + 1}. ${link.text} -> ${link.href}`);
    });

    console.log('\n🎯 Éléments possibles de compositions:');
    pageContent.possibleCompositions.forEach((el, i) => {
      console.log(`${i + 1}. ${el.tagName}.${el.className}: "${el.textContent}"`);
    });

    console.log('\n📦 Éléments de type carte:');
    pageContent.cardElements.forEach((el, i) => {
      console.log(`${i + 1}. ${el.tagName}.${el.className}: "${el.textContent}"`);
    });

    console.log('\n📝 Structure HTML (extrait):');
    console.log(pageContent.bodyHTML);

    // Prendre une capture d'écran pour debug
    await page.screenshot({ 
      path: 'debug-metatft.png',
      fullPage: true 
    });
    console.log('📸 Capture d\'écran sauvegardée: debug-metatft.png');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await browser.close();
  }
}

// Exécution
debugMetaTFT().catch(console.error); 