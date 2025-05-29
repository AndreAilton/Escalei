# Calendário Escala Anual (Escalei)

## [Link do Projeto](https://andreailton.github.io/Escalei/)  
[**Monte Sua Escala**](https://andreailton.github.io/Escalei/)


## Resumo

Este projeto é uma aplicação web para geração e visualização de escalas anuais de trabalho, permitindo o cadastro dinâmico de turnos, configuração de dias trabalhados, folgas e data de início. O sistema salva automaticamente as configurações e a escala gerada no navegador, garantindo persistência dos dados mesmo após atualizar a página.

## Dependências

- **React** (com TypeScript)
- **dayjs**: Manipulação de datas
- **@dnd-kit/core** e **@dnd-kit/sortable**: Drag and drop para ordenação dos turnos
- **Tailwind CSS**: Estilização da interface

## Estrutura do Projeto

- **src/components/Calendar/index.tsx**: Componente principal do calendário, onde estão as regras de negócio, manipulação de turnos, geração da escala e persistência no localStorage.
- **src/main.tsx**: Ponto de entrada da aplicação React.
- **index.html**: Estrutura base da aplicação.

## Funcionalidades

- **Adicionar Turnos**: Cadastre quantos turnos desejar, com nomes personalizados.
- **Ordenação de Turnos**: Arraste para reordenar os turnos (drag and drop).
- **Configuração de Dias e Folgas**: Defina quantos dias trabalhados e quantos de folga cada turno terá (permitindo inclusive folga zero).
- **Data de Início**: Escolha a data inicial da escala.
- **Geração da Escala**: Clique em "Gerar Calendário" para criar a escala anual baseada nas configurações.
- **Persistência Local**: Todas as configurações e a escala gerada são salvas automaticamente no localStorage.
- **Interface Responsiva**: Layout adaptável para desktop e mobile.

## Boas Práticas

- **Persistência automática**: Uso de localStorage para salvar turnos, dias, folgas, data de início e escala.
- **Componentização**: Separação clara entre lógica de negócio e apresentação.
- **Validação de Dados**: Impede turnos duplicados e campos obrigatórios vazios.
- **Acessibilidade**: Inputs e botões com labels claros.
- **Drag and Drop**: Implementação moderna e acessível para ordenação dos turnos.

## Como rodar o projeto

1. Instale as dependências:
   ```bash
   npm install
