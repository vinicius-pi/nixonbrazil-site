const button = document.querySelector('#copy-feed');
const field = document.querySelector('#feed-url');
const status = document.querySelector('#feed-status');

button?.addEventListener('click', async () => {
  if (!(field instanceof HTMLInputElement)) return;

  try {
    await navigator.clipboard.writeText(field.value);
    button.textContent = 'Endereço copiado';
    if (status) status.textContent = 'Endereço do feed copiado.';
  } catch {
    field.focus();
    field.select();
    button.textContent = 'Copie o endereço selecionado';
    if (status) status.textContent = 'Não foi possível copiar automaticamente. O endereço está selecionado para você copiar.';
  }
});
