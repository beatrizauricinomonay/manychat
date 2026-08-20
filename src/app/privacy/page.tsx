export const metadata = {
  title: "Política de Privacidade — InstaFlow",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-slate-800">
      <h1 className="text-2xl font-bold">Política de Privacidade — InstaFlow</h1>
      <p className="mt-2 text-sm text-slate-500">Última atualização: 2026</p>

      <section className="mt-8 space-y-4 text-sm leading-relaxed">
        <p>
          O InstaFlow é uma ferramenta que permite à proprietária de uma conta
          profissional do Instagram criar automações de resposta para
          mensagens diretas e comentários, usando a API oficial da Meta
          (Instagram Graph API).
        </p>

        <h2 className="text-lg font-semibold text-slate-900">
          Quais dados são processados
        </h2>
        <p>
          Ao ativar uma automação, a aplicação recebe, via webhook da Meta,
          o conteúdo das mensagens diretas e comentários enviados à conta do
          Instagram conectada, incluindo o identificador do remetente,
          necessário para responder à pessoa correta. Esses dados são
          usados exclusivamente para decidir qual automação disparar e
          executar as ações configuradas pela usuária (enviar uma
          resposta, por exemplo).
        </p>

        <h2 className="text-lg font-semibold text-slate-900">
          Armazenamento
        </h2>
        <p>
          As automações configuradas (gatilhos e ações) e um histórico
          resumido das execuções (se a automação disparou com sucesso ou
          não) ficam armazenados em um banco de dados próprio da aplicação.
          Tokens de acesso à API da Meta são armazenados apenas como
          variáveis de ambiente do servidor, nunca no código-fonte ou em
          texto acessível publicamente.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">
          Compartilhamento com terceiros
        </h2>
        <p>
          Os dados processados não são vendidos nem compartilhados com
          terceiros. A única comunicação externa realizada pela aplicação é
          com a própria Instagram Graph API (Meta), para receber eventos e
          enviar respostas automáticas em nome da conta conectada.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">
          Contato
        </h2>
        <p>
          Para dúvidas sobre esta política ou solicitação de exclusão de
          dados, entre em contato com a proprietária desta conta do
          Instagram.
        </p>
      </section>
    </div>
  );
}
