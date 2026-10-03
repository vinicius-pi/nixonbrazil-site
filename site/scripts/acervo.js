const search = document.querySelector('#archive-search');
const filter = document.querySelector('#archive-filter');
const rows = [...document.querySelectorAll('.archive-row')];
const empty = document.querySelector('#archive-empty');
const normalize = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR');

const update = () => {
  const query = normalize((search?.value || '').trim());
  const category = filter?.value || '';
  let visible = 0;

  rows.forEach((row) => {
    const matchText = !query || normalize(row.dataset.search).includes(query);
    const matchCategory = !category || row.dataset.category === category;
    row.hidden = !(matchText && matchCategory);
    if (!row.hidden) visible++;
  });

  empty.hidden = visible > 0;
};

search?.addEventListener('input', update);
filter?.addEventListener('change', update);
window.addEventListener('pageshow', update);
