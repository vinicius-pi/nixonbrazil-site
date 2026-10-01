const button = document.querySelector('#copy-feed');
const field = document.querySelector('#feed-url');

button?.addEventListener('click', async () => {
  if (!(field instanceof HTMLInputElement)) return;

  try {
    await navigator.clipboard.writeText(field.value);
    button.textContent = 'Endereço copiado';
  } catch {
    field.select();
    button.textContent = 'Copie o endereço selecionado';
  }
});
