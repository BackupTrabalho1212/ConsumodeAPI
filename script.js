document.addEventListener('DOMContentLoaded', function() {
    // Máscara para telefone
    const telefone = document.getElementById('telefone');
    if (telefone) {
        telefone.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            
            if (value.length > 0) {
                value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                if (value.length > 10) {
                    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                } else {
                    value = value.replace(/(\d)(\d{3})$/, '$1-$2');
                }
            }
            
            e.target.value = value;
        });
    }
    
    // Máscara para CPF
    const cpf = document.getElementById('cpf');
    if (cpf) {
        cpf.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            
            e.target.value = value;
        });
    }
    
    // Máscara e validação do CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            // Aplica máscara XXXXX-XXX
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 5) {
                value = value.substring(0, 5) + '-' + value.substring(5, 8);
            }
            e.target.value = value;
            
            // Limpa mensagens de erro enquanto digita
            document.getElementById('cep-error').style.display = 'none';
        });

        // Busca o CEP quando o campo perde o foco
        cepInput.addEventListener('blur', function(e) {
            const cep = e.target.value.replace(/\D/g, '');
            if (cep.length === 8) {
                buscarCEP(cep);
            } else if (cep.length > 0) {
                showCepError('CEP inválido (deve ter 8 dígitos)');
            }
        });
    }

    // Função para buscar CEP
    function buscarCEP(cep) {
        const loadingElement = document.getElementById('cep-loading');
        const errorElement = document.getElementById('cep-error');
        
        // Mostra loading e esconde erro
        loadingElement.style.display = 'inline';
        errorElement.style.display = 'none';
        
        // Limpa campos de endereço
        document.getElementById('rua').value = '';
        document.getElementById('bairro').value = '';
        document.getElementById('cidade').value = '';
        document.getElementById('uf').value = '';

        // Tenta ViaCEP primeiro
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => {
                if (!response.ok) throw new Error('Erro na requisição');
                return response.json();
            })
            .then(data => {
                if (data.erro) {
                    throw new Error('CEP não encontrado');
                }
                
                // Preenche os campos
                document.getElementById('rua').value = data.logradouro || '';
                document.getElementById('bairro').value = data.bairro || '';
                document.getElementById('cidade').value = data.localidade || '';
                document.getElementById('uf').value = data.uf || '';
                
                // Foca no campo número
                document.getElementById('numero').focus();
            })
            .catch(error => {
                console.error('Erro ViaCEP:', error);
                // Fallback para BrasilAPI se ViaCEP falhar
                return fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
            })
            .then(response => {
                if (!response || !response.ok) throw new Error('CEP não encontrado');
                return response.json();
            })
            .then(data => {
                if (data.street) { // BrasilAPI retorna diferente
                    document.getElementById('rua').value = data.street || '';
                    document.getElementById('bairro').value = data.neighborhood || '';
                    document.getElementById('cidade').value = data.city || '';
                    document.getElementById('uf').value = data.state || '';
                    document.getElementById('numero').focus();
                }
            })
            .catch(error => {
                console.error('Erro BrasilAPI:', error);
                showCepError(error.message || 'CEP não encontrado');
            })
            .finally(() => {
                loadingElement.style.display = 'none';
            });
    }

    function showCepError(message) {
        const errorElement = document.getElementById('cep-error');
        errorElement.textContent = message;
        errorElement.style.display = 'inline';
    }

    // Validação do formulário
    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const inputs = formCadastro.querySelectorAll('input[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.style.borderColor = 'red';
                    isValid = false;
                } else {
                    input.style.borderColor = '#ddd';
                }
            });
            
            // Validação específica do CEP
            const cep = document.getElementById('cep').value.replace(/\D/g, '');
            if (cep.length !== 8) {
                showCepError('CEP inválido (deve ter 8 dígitos)');
                isValid = false;
            }
            
            if (isValid) {
                alert('Cadastro realizado com sucesso!');
                formCadastro.reset();
            } else {
                alert('Por favor, preencha todos os campos obrigatórios corretamente.');
            }
        });
    }
});