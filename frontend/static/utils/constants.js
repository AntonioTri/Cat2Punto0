// Definiamo le azioni
const commanderActions      =     ['Risorse', 'Prove', 'Distribuzione', 'Permessi', 'ciao_hello'];
const decritterAction       =     ['ALPHA', 'BETA', 'GAMMA', 'Sistemi', 'Codici', 'Recupero', 'ciao_hello'];
const detectiveActions      =     ['Deduzione', 'Timeline', 'Fascicoli', 'Broadcast', 'ciao_hello'];
const admin                 =     ['create_team', 'add_team_member', 'download_team', 'reset_passwords'];
const roles                 =     ['COMANDANTE', 'DECRITTATORE', 'DETECTIVE', 'ESPLORATORE'];

const welcomeCommander = `
<strong>Benvenuto Comandante ${localStorage.getItem('personal_name')}.</strong><br>
Classificazione: <strong>Livello AEGIS</strong><br>
Stato documento: <em>RECUPERATO | [DATA_CORROTTA]</em><br>
Provenienza: [Unità Centrale – Nodo 7E: Eldia-Ovest]<br><br>

<hr>

<blockquote>“Quando la città ha smesso di respirare, qualcuno doveva decidere chi poteva ancora parlare.”</blockquote><br>

Salve, <strong>Comandante</strong>.<br>
Il tuo accesso è stato convalidato.<br>
Le coordinate sono state riconosciute.<br>
La tua presenza, finalmente, è registrata.<br><br>

Non ti verranno fornite <em>tutte</em> le risposte.<br>
Non qui.<br>
Non ora.<br><br>

Ma ciò che devi sapere è che <strong>Eldia è crollata</strong>, e lo ha fatto in silenzio.<br>
Un <em>silenzio troppo ordinato</em>, troppo perfetto per essere frutto del caso.<br>
Le torri sono rimaste in piedi, ma le fondamenta hanno tremato.<br>
Le <strong>persone</strong> si sono spente a una a una, lasciando dietro di sé solo <em>fascicoli non letti</em>.<br>
<em>O non ancora autorizzati alla lettura.</em><br><br>

<blockquote><code>[corruzione_dati: ██████████] …nessun segno di violazione fisica… ma la memoria collettiva si è fratturata…</code></blockquote><br>

<hr>

Il tuo compito non è quello di combattere.<br>
Non di cercare gloria.<br>
Non di inseguire un colpevole.<br><br>

<strong>Tu sei qui per gestire il caos.</strong><br><br>

Dovrai <strong>distribuire le risorse</strong>, <strong>monitorare i movimenti</strong>, <strong>decidere chi merita di accedere alle informazioni</strong>, e chi no.<br>
Ci sono agenti sul campo — Decrittatori, Detective, altri <em>pezzi</em> di un sistema che ha smesso di funzionare.<br><br>

E tutti guardano a te.<br>
O almeno… <em>guardano dove pensano che tu sia</em>.<br>
Perché i veri Comandanti, si sa, <strong>non si fanno mai vedere davvero</strong>.<br><br>

<hr>

<h3>Settore: PROVE</h3>

Hai accesso a documenti ad <strong>alta classificazione</strong>.<br>
Alcuni sono <em>distorti</em>, <em>criptati</em>, <em>sussurrati in linguaggi alchemici</em> che nessuno ha parlato da secoli.<br>
Altri sono semplicemente <em>bugiardi</em>.<br>
Sarà tuo compito capire la differenza.<br>
Potrai visionarli, analizzarli, e <strong>trasferire conoscenza</strong> — solo dove riterrai opportuno.<br><br>

Ma attenzione: <strong>ogni invio consuma risorse vitali</strong>.<br>
Hai a disposizione <strong>3 Token di Trasferimento</strong>. Si rigenerano lentamente.<br>
<em>Come la fiducia.</em><br><br>

<hr>

<h3>Settore: DECRITTATORI</h3>

Loro vedono stringhe, codici, enigmi.<br>
Ma dietro a ogni cifra c'è <em>una storia non detta</em>.<br>
Il tuo compito è inviare loro <strong>le coordinate giuste</strong>, una selezione di codici attendibili,<br>
e farlo al momento opportuno.<br><br>

Non anticipare.<br>
Non ritardare.<br><br>

Perché se dai troppo… <strong>qualcosa</strong> potrebbe guardarti indietro.<br><br>

<hr>

<h3>Settore: DETECTIVE</h3>

Loro cercano verità.<br>
Ma le verità, come sai, <em>non vogliono essere trovate</em>.<br>
Concedi loro nuovi fascicoli.<br>
Alimenta le loro indagini.<br>
Ma <strong>non lasciarti coinvolgere</strong>.<br><br>

<hr>

<blockquote>
“Non esiste ordine senza controllo.”<br>
“E non esiste controllo senza perdita.”
</blockquote><br>

<h4>⚠ [FRAMMENTO RECUPERATO – ARCHIVIO 04X]</h4>

<blockquote><em>
“Comandante █████, il progetto è andato oltre ogni previsione. Eldia era solo il primo test. Ci sono stati... errori. Distorcimenti nel codice genetico dei dati. Cose che non dovevano vedere. Cose che non dovevano imparare.”
</em></blockquote><br>

<hr>

I nodi si stanno chiudendo.<br>
Le rotte si stanno frammentando.<br>
Le informazioni diventano <em>polvere nei condotti</em> della rete interna.<br><br>

Se fallisci, <strong>tutto verrà riavvolto</strong>.<br>
Se riesci, forse qualcuno ricorderà Eldia <em>come era davvero</em>.<br>
O almeno, come dovrebbe essere ricordata.<br><br>

Ma c’è una cosa che nessun glitch potrà mai cancellare:<br>
<strong>la tua firma è già impressa nei protocolli.</strong><br><br>

<strong>Benvenuto, Comandante.</strong><br>
Non guardarti indietro.<br>
<strong>Le ombre sanno riconoscere chi dubita.</strong><br><br><br><br><br><br><br>
`;


const welcomeDetective = `<div id="detectiveWelcome">
<p><b>✦ BENVENUTO, DETECTIVE ${localStorage.getItem('personal_name')}✦</b></p>
<p><i>Identificazione completata | Livello d’accesso: SPECULUM</i></p>
<p>...Recupero delle memorie attive in corso...</p>
<p><b>Analisi in esecuzione...</b></p>

<p>
  <b>Non sei un semplice osservatore.</b><br>
  Sei colui che vede il filo invisibile tra gli eventi. Dove altri vedono caos, tu tracci un ordine. Dove c’è silenzio, tu scorgi un’eco.
</p>

<p>
  In un mondo dove <b>le informazioni si travestono da rumore</b>, dove i dati vengono manipolati e le verità cancellate, il tuo compito è distinguere l’autentico dall’illusione.
</p>

<p>
  La città di <b>Eldia</b> è sprofondata in un incubo fatto di ombre e segnali contraddittori. <span style="text-decoration:line-through; background:black">&nbsp;Le autorità sono scomparse&nbsp;</span>. Il tempo stesso sembra piegarsi su di sé, lasciando solo frammenti, testimonianze incoerenti, e silenzi colmi di significato.
</p>

<p><b>La tua mente è la chiave.</b><br>
La tua capacità di dedurre, incrociare indizi e ricostruire la cronologia degli eventi sarà ciò che permetterà di avanzare. Nessun altro può farlo.</p>

<p>
  Come Detective, avrai accesso a tre strumenti fondamentali:
  <ul>
    <li><b>Deduzioni</b> – Inserisci le tue ipotesi nel sistema. Il <b>Flusso</b> ti ascolta e ricorderà quando glie lo dirai.</li>
    <li><b>Ricostruzioni Temporali</b> – Riorganizza gli eventi. Riassembla il puzzle del passato. Ogni collegamento corretto è una finestra sul vero volto di Eldia.</li>
    <li><b>Fascicoli</b> – Dossier, testimonianze, prove documentali. Alcuni giungeranno corrotti. Altri... saranno deliberatamente incompleti.</li>
  </ul>
</p>

<p>
  <b>ATTENZIONE:</b> Le informazioni che ti vengono fornite non sono sempre oggettive. <span style="text-decoration:line-through; background:black">&nbsp;Alcuni fascicoli sono stati manipolati&nbsp;</span>. Altri nascondono risposte solo visibili a chi sa leggere tra le righe.
</p>

<p>
  L’interfaccia che utilizzi reagisce ai tuoi input. Il sistema apprende. Una deduzione corretta può far crollare un’intera rete di menzogne. Ma un errore può rafforzarla.
</p>

<p>
  Ricorda: <i>non è la verità che cerchi, ma ciò che la nasconde.</i> L’apparenza è una maschera. Le testimonianze sono spesso specchi infranti. Le parole... <span style="text-decoration:line-through; background:black">&nbsp;non mentono sempre, ma quasi&nbsp;</span>.
</p>

<p style="color: #444; font-style: italic">
  <i>Ogni risposta che trovi è solo l’inizio di una nuova domanda.</i><br>
  <i>Ogni sequenza temporale che ricostruisci si lega ad una più profonda, più antica... forse mai registrata.</i>
</p>

<p>
  <b style="font-size: 1.1em; color: #2b4a8b">Benvenuto, Detective.</b><br>
  Il tempo è frammentato. Gli indizi sono sparsi. La verità ti aspetta... nascosta tra i vuoti.
</p>
</div></div><br><br><br><br><br><br><br>
`;



const welcomeDecritter = `<div id="decrittatoreWelcome">
<p><b>✦ ACCESSO CONCESSO ✦</b></p>
<p><b>Profilo riconosciuto:</b> DECRITTATORE ${localStorage.getItem('personal_name')}</p>
<p><i>Stazione assegnata:</i> Nodo [REDACTED] – Archivio Sud Eldia</p>
<p><b>... Caricamento delle routine cognitive ...</b></p>

<p>
  <b style="color:#b81414">AVVISO:</b> La città di <b>Eldia</b> non è più quella che conoscevamo. I segnali sono deboli, frammentati, e a tratti alterati da forze che sfuggono alla logica.
  Le comunicazioni attraversano filtri sconosciuti, e i <b>sistemi di criptaggio</b> si evolvono autonomamente.
</p>

<p><b>Compito assegnato:</b></p>
<p>
  Sei stato incaricato di <b>ricomporre la verità nascosta</b> dietro messaggi criptati, artefatti digitali corrotti e simboli che mutano sotto lo sguardo.
  I sistemi ALPHA, BETA e GAMMA sono le nostre uniche chiavi di accesso.<br><br>
  
  <ul>
    <li><b>ALPHA</b> – Combinazione numerica. Ogni cifra è un frammento di un ordine dimenticato.</li>
    <li><b>BETA</b> – Struttura logica. Cinque moduli binari, cinque verità distorte.</li>
    <li><b>GAMMA</b> – Percorso spaziale. Ogni nodo un passo, ogni passo un’ipotesi.</li>
  </ul>
</p>

<p>
  I dati non sono statici. I Comandanti hanno attivato il protocollo linguistico sperimentale: <b style="text-decoration: underline">Scritture Alchemiche</b>.<br>
  Il significato muta. Il contesto si piega. Una parola vista da un Detective può essere un'altra per un Decrittatore.
</p>

<p>
  Attiverai filtri, scoprirai pattern.<br>
  Ma attento, <b style="text-decoration: line-through black">non tutto ciò che è visibile è decifrabile</b>.
</p>

<p>
  Le prove che riceverai saranno talvolta frammenti corrotti. Altre volte saranno visioni, <span style="text-decoration:line-through; background:black">&nbsp;inviate da nessuno</span>, contenenti la chiave.<br>
  Ti verranno date possibilità uniche: <b>inserire deduzioni nei sistemi</b>, alterare gli output, sbloccare nodi sigillati dal disastro.
</p>

<p style="color: #444; font-style: italic">
  … Decifrare non è solo leggere.<br>
  È vedere il significato nel caos. È dare senso a ciò che è stato dimenticato.<br>
  È ricordare ciò che <span style="text-decoration:line-through; background:black">&nbsp;non ti è mai stato detto</span>.
</p>

<p>
  <b style="font-size: 1.1em; color: #2b4a8b">Preparati, Decrittatore.</b> Il codice è vivo.
</p>
</div><br><br><br><br><br><br><br>
`;

export {commanderActions, decritterAction, detectiveActions, admin, roles, welcomeCommander, welcomeDetective, welcomeDecritter};