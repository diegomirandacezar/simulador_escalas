# Projeto Malemi — Simulador de Escalas e Custos de Folha
## Prompt de análise, preparação do projeto e publicação segura no GitHub

## 0. Localização dos arquivos e instruções de contexto

Antes de iniciar, considere esta estrutura na raiz do projeto:

- **Prompt de trabalho:** pasta `.doc`. Localize e leia o prompt correspondente a esta tarefa.
- **Especificação:** pasta `.doc`. Localize e leia o arquivo `SPEC.md`.
- **Skills:** pasta `.agents`. Inspecione as skills disponíveis e leia as instruções pertinentes.
- **Informações do GitHub:** pasta `.docs`, arquivo `meu_git`.

Use os caminhos acima como referência inicial, mas confirme os nomes e a existência dos arquivos na estrutura real. Se algum arquivo não existir ou houver mais de uma correspondência possível, não invente conteúdo: informe a pendência e solicite esclarecimento. Não exiba nem copie para a saída valores secretos presentes em `meu_git`. Trate esse arquivo como potencialmente sensível: verifique se contém apenas informações seguras para uso local e **não o inclua no repositório nem o publique no GitHub**, a menos que a inspeção confirme que não há credenciais, tokens, dados privados ou outros segredos e que sua inclusão foi explicitamente autorizada.

Atue como um **Arquiteto de Software e Engenheiro DevOps**, com foco em preparar este projeto para ser versionado e publicado no GitHub de forma segura, limpa e reproduzível.

Seu objetivo é **analisar o projeto atual, corrigir o que for necessário, preparar o repositório Git e deixar tudo pronto para o primeiro commit e push**.

> **Importante:** o `git commit` e o `git push` NÃO devem ser executados por você. Ao final, entregue esses dois comandos prontos para que eu copie e execute manualmente.

## 1. Leia a especificação

Leia integralmente o arquivo `SPEC.md` localizado na raiz do projeto. Ele define os objetivos e as restrições do Simulador de Escalas e Custos de Folha da Malemi.

O sistema deverá importar dados de uma planilha Excel exportada do sistema de folha, permitir estruturar escalas de trabalho e, futuramente, comparar cenários com remuneração bruta e custos detalhados por evento.

**Nesta primeira etapa, não implemente fórmulas do motor de cálculo da folha.** Priorize o diagnóstico, a documentação, a segurança e a preparação do repositório.

## 2. Skills do Antigravity

Consulte a pasta local de skills do projeto e leia as instruções das skills relevantes antes de iniciar:

### Principais
- `plan-writing`
- `documentation-templates`
- `architecture`
- `testing-patterns`
- `systematic-debugging`

### Qualidade e implementação
- `clean-code`
- `code-review-checklist`
- `lint-and-validate`
- `app-builder`
- `frontend-design`
- `webapp-testing`
- `vulnerability-scanner`
- `deployment-procedures`

Use somente as skills realmente disponíveis e pertinentes. Não presuma que uma skill foi executada apenas por estar listada; informe quais instruções foram consultadas e quais skills foram utilizadas. Não instale dependências nem altere a stack sem justificar a necessidade.

## 3. Regras de segurança e preservação

- Preserve os arquivos existentes e evite alterações desnecessárias.
- Antes de modificar arquivos, inspecione o estado atual do projeto e identifique mudanças preexistentes.
- **Não apague, sobrescreva ou reverta mudanças do usuário.**
- Não execute `git commit` nem `git push`.
- Não publique arquivos com dados pessoais, salariais, credenciais, tokens, chaves, arquivos `.env` ou informações confidenciais.
- Utilize dados fictícios ou anonimizados durante o desenvolvimento.
- Não invente fórmulas, percentuais, regras trabalhistas ou convenções coletivas.
- Não descarte eventos desconhecidos da planilha nem trate dados ausentes como zero.
- Diferencie fatos observados, hipóteses e decisões pendentes.
- Não execute comandos destrutivos ou ações remotas sem autorização explícita.
- Não configure credenciais do GitHub nem solicite que eu compartilhe tokens ou senhas.

## 4. Etapa A — Diagnóstico do projeto

1. Leia o `SPEC.md` integralmente.
2. Inspecione a estrutura de diretórios e os arquivos existentes.
3. Identifique linguagem, framework, dependências, scripts, ferramentas de build e testes.
4. Verifique se o projeto já está sob Git e inspecione o estado atual com comandos somente de leitura, como `git status`, `git branch --show-current`, `git remote -v` e `git log -1` quando aplicáveis.
5. Identifique arquivos temporários, artefatos gerados, dependências locais, dados de teste e possíveis segredos.
6. Consulte as skills disponíveis e registre as que foram efetivamente usadas.
7. Apresente um resumo dos riscos e das correções necessárias antes de fazer mudanças significativas.

Se não houver repositório Git, prepare a estrutura necessária sem apagar arquivos existentes. Se já houver repositório, preserve seu histórico e suas configurações.

## 5. Etapa B — Revisão e correções seguras

Faça apenas correções necessárias e justificadas para deixar o projeto limpo e reproduzível.

- Corrija problemas claros de configuração, documentação, organização ou validação.
- Não reescreva módulos funcionais sem necessidade.
- Não altere regras de negócio ou implemente cálculos de folha nesta etapa.
- Execute os testes e verificações que já existirem e que sejam seguros.
- Se testes falharem, documente o erro; não esconda nem declare sucesso sem evidência.
- Registre cada alteração relevante e sua justificativa.

## 6. Etapa C — Preparação para GitHub

Prepare os arquivos necessários conforme a stack realmente identificada:

- `.gitignore` adequado à tecnologia e ao ambiente;
- `.env.example` somente se houver variáveis de ambiente necessárias, usando valores fictícios e sem segredos;
- `README.md` com descrição, pré-requisitos, configuração, execução, testes, estrutura do projeto e limitações conhecidas;
- documentação adicional necessária para executar o projeto de forma reproduzível;
- configuração de testes e validações, se compatível com a estrutura existente.

Revise cuidadosamente o que poderá entrar no repositório. Verifique se há dados pessoais ou salariais, planilhas reais, arquivos de credenciais, tokens, chaves privadas, diretórios de dependências, builds ou arquivos locais que não devem ser publicados.

Não inclua arquivos reais de folha de pagamento no GitHub. Se houver necessidade de demonstrar importação, use apenas dados fictícios ou anonimizados.

## 7. Etapa D — Validação antes do primeiro commit

1. Execute as verificações e os testes apropriados disponíveis no projeto.
2. Informe exatamente quais comandos foram executados e seus resultados.
3. Revise o diff de todas as alterações.
4. Verifique o conteúdo que seria incluído no primeiro commit.
5. Prepare uma lista explícita de arquivos que devem ser versionados e arquivos que devem permanecer fora do Git.
6. Se possível, prepare o staging de forma seletiva, sem incluir arquivos desconhecidos ou sensíveis.
7. Se houver dúvidas sobre a inclusão de algum arquivo, deixe-o fora do staging e explique a pendência.
8. Não crie commit nem envie alterações para qualquer remoto.

## 8. Documentação funcional do simulador

Além da preparação do GitHub, verifique se a documentação do produto está organizada. Crie ou atualize, conforme necessário e sem sobrescrever conteúdo útil:

- `SPEC.md` — especificação principal;
- `docs/dicionario_dados.md` — estrutura dos dados de entrada;
- `docs/catalogo_eventos.md` — inventário dos eventos da folha;
- `docs/regras_calculo.md` — regras identificadas, fontes e pendências;
- `docs/plano_testes.md` — casos de teste e resultados esperados;
- `docs/decisoes_tecnicas.md` — arquitetura e decisões técnicas.

Não invente dados para preencher lacunas. Se a planilha de folha ainda não estiver disponível, prepare os modelos documentais, marque o catálogo como pendente e solicite uma cópia anonimizada para análise. Não invente eventos nem regras.

## 9. Requisitos funcionais a preservar

O projeto futuro deverá suportar, conforme as regras que forem validadas:

- Importação e análise de Excel;
- Inventário de todos os eventos da folha;
- Classificação de eventos dependentes e independentes da escala;
- Escalas-base e calendário mensal com edição manual;
- Turnos, intervalos, folgas e jornadas que atravessam a meia-noite;
- Comparação entre cenários;
- Remuneração bruta e custo total com componentes formalmente definidos;
- Detalhamento por evento, funcionário e filial;
- Memória de cálculo e rastreabilidade;
- Identificação explícita de dados e regras pendentes.

Os valores de jornada mencionados anteriormente (200 horas para mensalistas, 220 para horistas e possível referência de 180 para cargos específicos), assim como adicionais de 50% ou 100% e o tratamento de datas especiais, são hipóteses de levantamento que precisam ser confirmadas para cada grupo aplicável. Não os codifique como regras definitivas sem validação.

## 10. Critérios de conclusão

Considere o trabalho concluído somente quando entregar:

1. Diagnóstico do projeto e da estrutura Git.
2. Lista das skills consultadas e utilizadas.
3. Resumo das correções realizadas, com justificativas.
4. Lista de arquivos criados ou alterados.
5. Resultado real dos testes, lint e demais verificações executadas.
6. Avaliação de segurança e arquivos sensíveis.
7. Revisão dos arquivos que seriam incluídos no primeiro commit.
8. Pendências que dependem de decisão ou ação minha.
9. Instruções para configurar ou conferir o repositório remoto, se necessário.
10. Os comandos `git commit` e `git push` prontos para execução manual.

## 11. Comandos finais

Não execute estes comandos. Ao final, forneça os comandos adequados ao estado real do repositório, usando uma mensagem de commit descritiva e o nome correto da branch e do remoto identificados. Se essas informações não puderem ser confirmadas, use placeholders claros e explique como substituí-los.

Exemplo de formato, **apenas se corresponder ao estado real do repositório**:

```bash
git commit -m "chore: prepare project for GitHub"
git push -u origin <nome-da-branch>
```

Não afirme que o projeto está publicado ou que o push foi concluído. O trabalho só estará pronto para envio quando as verificações forem concluídas e eu executar os comandos manualmente.

## 12. Primeira ação

Comece lendo o `SPEC.md`, inspecionando o estado do projeto e consultando as skills disponíveis. Faça primeiro o diagnóstico. Depois, aplique somente as correções seguras e justificadas, valide tudo e prepare os comandos finais.

**Não execute `git commit` nem `git push` em nenhuma circunstância.**
