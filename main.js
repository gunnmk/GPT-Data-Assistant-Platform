const apiKey = 'sk...'; // 
require('dotenv').config();



// Função para verificar o status do Run
function pollRunStatus(threadId, runId) {
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "OpenAI-Beta": "assistants=v1"
                }
            })
            .then(response => response.json())
            .then(runStatusResponse => {
                if (runStatusResponse.status === 'completed') {
                    clearInterval(interval);
                    resolve(runStatusResponse);
                } else if (runStatusResponse.status === 'failed') {
                    clearInterval(interval);
                    reject(new Error('Run falhou'));
                }
            })
            .catch(error => {
                clearInterval(interval);
                reject(error);
            });
        }, 1000); // Polling a cada 1 segundo
    });
}

// Função para recuperar mensagens da Thread
function getThreadMessages(threadId) {
    return fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "OpenAI-Beta": "assistants=v1"
        }
    })
    .then(response => response.json());
}

// Função para enviar mensagem e processar a resposta
function sendMessage() {
    var userMessage = document.getElementById('message-input').value;
    if (!userMessage) {
        document.getElementById('message-input').style.border = '1px solid red';
        return;
    }
    document.getElementById('message-input').style.border = 'none';

    var status = document.getElementById('status');
    var btnSubmit = document.getElementById('btn-submit');

    status.style.display = 'block';
    status.innerHTML = 'Carregando...';
    btnSubmit.disabled = true;
    btnSubmit.style.cursor = 'not-allowed';
    document.getElementById('message-input').disabled = true;

    let threadId;

    // Criar uma Thread
    fetch("https://api.openai.com/v1/threads", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "OpenAI-Beta": "assistants=v1"
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(threadResponse => {
        threadId = threadResponse.id;

        // Adicionar uma Message à Thread
        return fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v1"
            },
            body: JSON.stringify({
                "role": "user",
                "content": userMessage
            })
        });
    })
    .then(() => {
        // Criar uma Run com o Assistente
        return fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "OpenAI-Beta": "assistants=v1"
            },
            body: JSON.stringify({
                "assistant_id": "asst_..."
            })
        });
    })
    .then(response => response.json())
    .then(runResponse => {
        if (runResponse.status === 'queued') {
            return pollRunStatus(threadId, runResponse.id);
        } else if (runResponse.status === 'completed') {
            return Promise.resolve(runResponse);
        } else {
            throw new Error('Status da Run desconhecido');
        }
    })
    .then(() => {
        // Recuperar as mensagens da thread
        return getThreadMessages(threadId);
    })
    .then(messagesResponse => {
        // Processar as mensagens
        messagesResponse.data.forEach(message => {
            if (message.role === 'assistant') {
                // Extrair a mensagem do array de objetos
                let responseMessage = message.content.map(obj => obj.text.value).join(' ');
                status.style.display = 'none';
                showHistory(userMessage, responseMessage);
            }
        });
    })
    .catch(e => {
        console.log(`Error -> ${e.message}`);
        status.innerHTML = `Erro, tente novamente mais tarde... Detalhes do erro: ${e.message}`;
    })
    .finally(() => {
        btnSubmit.disabled = false;
        btnSubmit.style.cursor = 'pointer';
        document.getElementById('message-input').disabled = false;
        document.getElementById('message-input').value = '';
    });
}

// Função para mostrar o histórico de mensagens
function showHistory(userMessage, responseMessage) {
    var historyBox = document.getElementById('history');

    // Adicionar formatação de parágrafos à mensagem de resposta
    responseMessage = responseMessage.replace(/#START_QUERY/g, '<p>#START_QUERY');
    responseMessage = responseMessage.replace(/#END_QUERY/g, '#END_QUERY</p>');
    responseMessage = responseMessage.replace(/\n/g, '<br>');

    // Mensagem do Usuário
    var boxMyMessage = document.createElement('div');
    boxMyMessage.className = 'box-my-message';

    var myMessage = document.createElement('p');
    myMessage.className = 'my-message';
    myMessage.innerHTML = userMessage;

    boxMyMessage.appendChild(myMessage);
    historyBox.appendChild(boxMyMessage);

    // Mensagem de Resposta
    var boxResponseMessage = document.createElement('div');
    boxResponseMessage.className = 'box-response-message';

    var chatResponse = document.createElement('p');
    chatResponse.className = 'response-message';
    chatResponse.innerHTML = responseMessage; // A mensagem de resposta agora contém formatação HTML

    boxResponseMessage.appendChild(chatResponse);
    historyBox.appendChild(boxResponseMessage);

    // Rolagem para o final
    historyBox.scrollTop = historyBox.scrollHeight;
}
