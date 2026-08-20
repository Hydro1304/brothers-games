const products = [
  {
    id: "gta-v",
    name: "GRAND THEFT AUTO V (GTA V)",
    price: 70.00,
    category: "Jogos",
    image: "/products/gta-v.jpg.jfif",
    description:
      "Viva a liberdade absoluta e o caos urbano! Bem-vindo a Los Santos, a metrópole onde tudo é possível. Assuma o controle de três protagonistas inesquecíveis — Michael, Franklin e Trevor — em uma jornada épica de assaltos milionários, fugas alucinantes e pura adrenalina. Explore um mundo aberto gigantesco, mergulhe no caótico GTA Online e construa seu próprio império do crime. O limite? Você quem dita!"
  },

  {
    id: "call-of-duty",
    name: "CALL OF DUTY",
    price: 220.00,
    category: "Jogos",
    image: "/products/call-of-duty.jpg.jfif",
    description:
      "O campo de batalha chama por você. Está pronto para responder? Prepare-se para a experiência definitiva de tiro em primeira pessoa. Com gráficos ultrarrealistas, um arsenal devastador e modos multiplayer que vão testar seus reflexos ao máximo, Call of Duty coloca você no centro de conflitos globais intensos. Domine a zona de guerra, monte seu esquadrão e faça história. Cada milissegundo conta, soldado!"
  },

  {
    id: "resident-evil-7",
    name: "RESIDENT EVIL 7: BIOHAZARD",
    price: 55.00,
    category: "Jogos",
    image: "/products/resident-evil-7.jpg.jfif",
    description:
      "Sobreviva ao terror definitivo em primeira pessoa. O medo nunca foi tão real. Explore a sinistra e isolada propriedade da família Baker nos pântanos da Louisiana. Com uma atmosfera sufocante, recursos escassos e horrores espreitando em cada corredor, Resident Evil 7 redefine o gênero survival horror. Você tem coragem suficiente para descobrir os segredos macabros que se escondem nas sombras?"
  },

  {
    id: "red-dead-2",
    name: "RED DEAD REDEMPTION 2",
    price: 100.00,
    category: "Jogos",
    image: "/products/red-dead-2.jpg.jfif",
    description:
      "A lenda do Velho Oeste em uma obra-prima inesquecível. Junte-se a Arthur Morgan e à gangue de Van der Linde em uma fuga desesperada pelo coração implacável da América no fim do século XIX. Com um dos mundos abertos mais vivos e deslumbrantes já criados, Red Dead Redemption 2 entrega uma narrativa emocionante sobre lealdade, sobrevivência e o preço da liberdade. Prepare seu cavalo, saque seu revólver e escreva seu legado."
  },

  {
    id: "fc-26",
    name: "EA SPORTS FC 26",
    price: 240.00,
    category: "Jogos",
    image: "/products/fc-26.jpg.jfif",
    description:
      "O Jogo do Mundo no nível máximo de imersão! Entre em campo com a tecnologia de futebol mais avançada da história. EA FC 26 traz o realismo absoluto para as suas mãos, com movimentos fluidos, craques idênticos à realidade e os maiores estádios do planeta. Construa o seu time dos sonhos no Ultimate Team, domine a carreira e sinta a vibração de cada gol como se estivesse na arquibancada. A glória espera por você!"
  },

  {
    id: "monitor-24",
    name: 'MONITOR GAMER 24" 144HZ PRO',
    price: 899.90,
    category: "Monitores",
    image: "/products/monitor-24.jpg.jfif",
    description:
      "Veja o inimigo antes que ele veja você! Diga adeus aos rastros na tela e assuma a vantagem competitiva que você merece. Com uma taxa de atualização ultrarrápida de 144Hz e tempo de resposta de 1ms, este monitor de 24 polegadas entrega imagens perfeitamente fluidas e nítidas no calor da batalha. Ideal para quem busca precisão cirúrgica em jogos de tiro, corrida ou esportes. A sua janela para a vitória nunca foi tão clara."
  },

  {
    id: "mouse-rgb",
    name: "MOUSE GAMER RGB PRO",
    price: 149.90,
    category: "Mouses",
    image: "/products/mouse-rgb.jpg.jfif",
    description:
      "Precisão letal e estilo incomparável na palma da sua mão. Projetado para quem não aceita menos que a perfeição. Com um sensor óptico de altíssima precisão e ajustes dinâmicos de DPI, cada clique é um headshot garantido. Além da performance de elite, sua iluminação RGB personalizável transforma seu setup em um verdadeiro espetáculo visual. Domine o jogo com velocidade, ergonomia e estilo extremo."
  },

  {
    id: "controle-wireless",
    name: "CONTROLE WIRELESS PRO",
    price: 249.90,
    category: "Controles",
    image: "/products/controle-wireless.jpg.jfif",
    description:
      "Liberdade sem fios, controle sem limites. Jogue no seu ritmo, de onde quiser, sem perder um único milissegundo de resposta. Este controle wireless oferece ergonomia superior para maratonas de jogos, gatilhos de alta sensibilidade e uma bateria de longa duração. Sinta a imersão de cada explosão e impacto nas suas mãos com motores de vibração dupla. O poder está totalmente sob o seu comando."
  },

  {
    id: "mousepad-xl",
    name: "MOUSEPAD GAMER SPEED XL",
    price: 79.90,
    category: "Mousepads",
    image: "/products/mousepad-xl.jpg.jfif",
    description:
      "O palco perfeito para jogadas de mestre. Espaço de sobra para movimentos épicos! O Mousepad Speed XL cobre grande parte da sua mesa, oferecendo uma superfície micro-texturizada otimizada para rastreamento impecável e velocidade extrema. Com bordas costuradas de alta durabilidade e base emborrachada antiderrapante, ele garante que apenas o seu mouse se mova, mesmo nas partidas mais intensas."
  },

  {
    id: "headset-71",
    name: "HEADSET GAMER 7.1 PRO SURROUND",
    price: 199.90,
    category: "Headsets",
    image: "/products/headset-71.jpg.jfif",
    description:
      "Ouça cada passo. Antecipe cada movimento. Mergulhe no campo de som com áudio espacial 7.1 de cair o queixo. Este headset foi projetado para imersão total, permitindo que você identifique exatamente de onde vêm os tiros e os inimigos. Com drivers potentes, espumas de memória ultraconfortáveis para horas de jogo e um microfone com cancelamento de ruído que garante comunicação cristalina com seu esquadrão, você não vai apenas jogar; você vai estar dentro do jogo."
  },

  {
    id: "teclado-rgb",
    name: "TECLADO MECÂNICO RGB PRO",
    price: 229.90,
    category: "Teclados",
    image: "/products/teclado-rgb.jpg.jfif",
    description:
      "A arma definitiva para dedos ágeis. Sinta o click da vitória. Equipado com switches mecânicos de alta durabilidade, este teclado oferece um tempo de resposta tátil incrivelmente rápido e sistema 100% Anti-Ghosting. Cada tecla que você pressiona é registrada no ato. Construído em estrutura premium e inundado por uma iluminação RGB dinâmica e personalizável, ele é o coração pulsante do seu setup gamer."
  }
];

export default products;