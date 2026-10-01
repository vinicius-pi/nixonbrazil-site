const search = document.querySelector('#archive-search');
const filter = document.querySelector('#archive-filter');
const rows = [...document.querySelectorAll('.archive-row')];
const empty = document.querySelector('#archive-empty');

const update = () => {
  const query = (search?.value || '').trim().toLowerCase();
  const category = filter?.value || '';
  let visible = 0;

  rows.forEach((row) => {
    const matchText = !query || row.dataset.search.includes(query);
    const matchCategory = !category || row.dataset.category === category;
    row.hidden = !(matchText && matchCategory);
    if (!row.hidden) visible++;
  });

  empty.hidden = visible > 0;
};

search?.addEventListener('input', update);
filter?.addEventListener('change', update);
