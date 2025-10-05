export default function Integritet() {
  return (
    <article style={{ lineHeight: 1.6 }}>
      <h1>Integritetspolicy</h1>
      <p>Vi lagrar inte din text. För drift sparar vi tekniska loggar (IP-hash, tidsstämpel, statuskod, antal tecken) i upp till <strong>2 dagar</strong>. Inga analyscookies används.</p>
      <h2>Vilka uppgifter behandlas?</h2>
      <ul>
        <li>IP-adress (för rate limiting; används som nyckel i loggar)</li>
        <li>Tidsstämpel och antal tecken</li>
        <li>Captcha-resultat</li>
      </ul>
      <p>Din inskickade text skickas till vår språkmodell-leverantör (OpenAI) för att kunna rättas. Vi sparar inte texten i vår databas.</p>
      <h2>Kontakt</h2>
      <p>Frågor? Mejla <a href="mailto:kundservice@mamosta.se">kundservice@mamosta.se</a>.</p>
    </article>
  );
}
