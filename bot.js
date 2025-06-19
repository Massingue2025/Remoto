const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch(); // Headless por padrão
  const page = await browser.newPage();

  console.log('🌐 Acessando página protegida...');
  await page.goto('https://livestream.ct.ws/M/data.php', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // Espera o JS rodar, cookies serem definidos e redirecionamento automático
  await page.waitForLoadState('networkidle');
  const finalUrl = page.url();
  console.log('✅ Redirecionado para:', finalUrl);

  // Calcula o tempo atual em Moçambique (UTC+2)
  const agora = new Date(new Date().getTime() + 2 * 60 * 60 * 1000);
  const tempoMaputo = agora.toISOString().split('.')[0];

  // Envia o tempo via POST para o servidor
  const resposta = await page.evaluate(async (tempo) => {
    try {
      const res = await fetch('https://livestream.ct.ws/M/data.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'tempo=' + encodeURIComponent(tempo)
      });
      return await res.text();
    } catch (e) {
      return 'Erro ao enviar: ' + e.message;
    }
  }, tempoMaputo);

  console.log('📤 Tempo enviado:', tempoMaputo);
  console.log('📦 Resposta do servidor:\n', resposta);

  await browser.close();
})();
