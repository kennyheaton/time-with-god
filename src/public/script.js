async function getGreeting() {
  const response = await fetch('/api/greeting/hello')
  return response.json();
}

async function updateGreeting(greeting) {
  await fetch('/api/greeting/hello', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: `{ "message": "${greeting}" }`
  });
}

document.addEventListener('DOMContentLoaded',(async function() {
  document.getElementById('click').addEventListener('click', async function() {
    await updateGreeting(document.getElementById('update').value);
    document.getElementById('update').value = '';
    document.getElementById('greeting').innerHTML = (await getGreeting()).message;
  });
  document.getElementById('greeting').innerHTML = (await getGreeting()).message;
}));
