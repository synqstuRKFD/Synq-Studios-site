#!/usr/bin/env python3
"""Build the Cinematic family (cine-neon / cine-gold / cine-fuego / cine-sunset) from one template.

Edit the content in TEMPLATE below (or a theme's hero), then run:
    python3 build-cinematic.py
Every version gets the same content: rates, EN/ES, booking quiz, deposit info, etc.
"""
from pathlib import Path


def wsrc(i):
    return f"images/{i}.jpg" if i.startswith("studio/") else f"images/tiktok/{i}.jpg"

ROOT = Path(__file__).resolve().parent
GF = "https://fonts.googleapis.com/css2?family="

HERO_CONTENT = """
        <h1 class="kicker" data-es="Estudio de grabación en Rockford, Illinois">Recording studio in Rockford, Illinois</h1>
        <p class="big" data-es="Definido por el sonido.<br><span class='grad'>Impulsado por la calidad.</span>">Defined by sound.<br><span class="grad">Driven by quality.</span></p>
        <p class="hero__lead" data-es="Grabación de voz, mezcla y master, grabación de bandas y videos musicales para artistas de cualquier género. Raperos, cantantes, bandas y grupos. <em>We speak English too.</em>">Vocal recording, mixing and mastering, band recording and music videos for artists of any genre. Rappers, singers, bands and grupos. <em>Se habla español.</em></p>
        <div class="hero__cta">
          <a href="https://squareup.com/appointments/book/L6PTGPVMKXW8A" target="_blank" rel="noopener" class="pill pill--solid" data-track="square_hero" data-es="Reservar una sesión">Book a session</a>
          <a href="#work" class="pill" data-track="hero_work" data-es="Escuchar nuestro trabajo">Hear our work</a>
        </div>
        <p class="hero__ask" data-es="¿Preguntas? <a href='#book' class='js-text' data-track='sms_hero'>Mándanos un texto</a>.">Questions? <a href="#book" class="js-text" data-track="sms_hero">Send us a text</a>.</p>
"""

THEMES = {
    "neon": dict(
        label="Neon", fonts="Unbounded:wght@400;600;800&family=Space+Grotesk:wght@400;500;600;700",
        hero=f"""<section class="hero hero--photo">
      <img class="hero__bg" src="images/tiktok/7701768023165734175.jpg" alt="">
      <div class="hero__shade"></div>
      <div class="hero__content">{HERO_CONTENT}
      </div>
    </section>"""),
    "gold": dict(
        label="Gold Film", fonts="Cinzel:wght@600;700&family=Inter:wght@400;500;600;700",
        hero=f"""<section class="hero hero--film">
      <img class="hero__bg" src="images/tiktok/7706334317819022622.jpg" alt="">
      <div class="hero__shade"></div>
      <div class="grain" aria-hidden="true"></div>
      <div class="hero__content">{HERO_CONTENT}
        <p class="hero__now" data-es="Una producción de SYNQ Studios">A SYNQ Studios production</p>
      </div>
    </section>"""),
    "fuego": dict(
        label="Fuego Wall", fonts="Anton&family=Inter:wght@400;500;600;700;800",
        hero="""<section class="hero hero--wall">
      <div class="wall" aria-hidden="true">
        <div class="wall__row">""" + "".join(f'<img src="{wsrc(i)}" alt="">' for i in ["7690698899966659871","7701768023165734175","7706334317819022622","studio/recording-drums-purple","7705145530703203614","studio/mixing-room"] * 6) + """</div>
        <div class="wall__row wall__row--rev">""" + "".join(f'<img src="{wsrc(i)}" alt="">' for i in ["7683332505428102430","studio/recording-booth","7698509898446818590","7701434503016811807","studio/lounge","7690698899966659871"] * 6) + """</div>
        <div class="wall__row">""" + "".join(f'<img src="{wsrc(i)}" alt="">' for i in ["7706334317819022622","7697746982508498207","7701768023165734175","studio/mixing-screens","studio/recording-room","7700765015468559647"] * 6) + f"""</div>
      </div>
      <div class="hero__shade"></div>
      <div class="hero__content">{HERO_CONTENT}
      </div>
    </section>"""),
    "sunset": dict(
        label="Sunset", fonts="DM+Serif+Display&family=Inter:wght@400;500;600;700",
        hero=f"""<section class="hero hero--phone">
      <img class="hero__bg" src="images/youtube/0g0u0fXxJAY.jpg" alt="">
      <div class="hero__shade"></div>
      <div class="hero__content">{HERO_CONTENT}
      </div>
      <button class="phone" data-tt="7683332505428102430" data-track="hero_tour" aria-label="Play the studio tour video">
        <span class="phone__notch"></span>
        <img src="images/tiktok/7683332505428102430.jpg" alt="">
        <span class="play"></span>
        <span class="phone__tag" data-es="▶ Tour del estudio · 13.4K">▶ Studio tour · 13.4K views</span>
      </button>
    </section>"""),
}

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Recording Studio in Rockford, IL | SYNQ Studios — Rockford · Chicago</title>
  <meta name="description" content="Recording studio in Rockford, IL. Vocal recording $50/hr, mixing $30, sierreño & norteño grupos $150/song, live music videos, reels and photo sessions. Se habla español. Book online.">
  <meta property="og:title" content="SYNQ Studios 🏆 Rockford · Chicago">
  <meta property="og:image" content="images/og-share.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="images/synq-logo.jpg">
  <link href="{gf}{fonts}&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="layouts/base.css">
  <link rel="stylesheet" href="layouts/cine.css">
  <link rel="stylesheet" href="layouts/cine-{key}.css">
  <script type="application/ld+json">
  {{"@context":"https://schema.org","@type":"LocalBusiness","additionalType":"https://en.wikipedia.org/wiki/Recording_studio","name":"SYNQ Studios","slogan":"Defined By Sound, Driven By Quality","image":"images/synq-logo.jpg","priceRange":"$20–$250","paymentAccepted":"Cash, Zelle, Cash App, Apple Pay","knowsLanguage":["en","es"],"address":{{"@type":"PostalAddress","streetAddress":"4040 Charles St","addressLocality":"Rockford","addressRegion":"IL","postalCode":"61108","addressCountry":"US"}},"hasMap":"https://www.google.com/maps/search/?api=1&query=4040+Charles+St%2C+Rockford%2C+IL+61108","areaServed":["Rockford, IL","Chicago, IL","Northern Illinois"],"sameAs":["https://www.instagram.com/synq.studios/","https://www.tiktok.com/@synqstudios","https://www.youtube.com/@SynqStudios"]}}
  </script>
</head>
<body class="cine cine--{key}">
  <header class="top">
    <a href="#" class="brand"><img src="images/synq-mark.png" alt="" width="22" height="26"><span>SYNQ STUDIOS</span></a>
    <nav class="top__links" aria-label="Main">
      <a href="#work" data-es="Trabajo">Work</a><a href="#services" data-es="Servicios">Services</a><a href="#rates" data-es="Precios">Rates</a><a href="#studio" data-es="Estudio">Studio</a><a href="#book" class="js-text" data-track="sms_nav" data-es="Mandar texto">Text us</a>
    </nav>
    <a class="top__text js-text" href="#book" data-track="sms_topbar" aria-label="Text SYNQ Studios"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17.5H4A1.5 1.5 0 0 1 2.5 16V7A1.5 1.5 0 0 1 4 5.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></a>
    <div class="lang" role="group" aria-label="Language / Idioma"><button type="button" data-lang="en" aria-pressed="true">EN</button><button type="button" data-lang="es" aria-pressed="false">ES</button></div>
    <a href="https://squareup.com/appointments/book/L6PTGPVMKXW8A" target="_blank" rel="noopener" class="pill pill--solid" data-track="square_nav" data-es="Reservar">Book</a>
  </header>

  <main>
    {hero}

    <section class="strip" aria-label="SYNQ in numbers">
      <div><strong>29K+</strong><span data-es="Vistas TikTok + YouTube">Views TikTok + YouTube</span></div>
      <div><strong>14.6K</strong><span data-es="Likes en TikTok">Likes on TikTok</span></div>
      <div><strong>50+</strong><span data-es="Bandas y artistas grabados">Bands &amp; artists recorded</span></div>
      <div><strong>$50</strong><span data-es="Voces, por hora">Vocals, per hour</span></div>
    </section>

    <section class="block" id="services">
      <h2 class="block__title" data-es="Servicios">Services</h2>
      <ol class="svc">
        <li><h3 data-es="Grabación de voz">Vocal Recording</h3><p data-es="Para raperos, cantantes y artistas grabando sobre su beat. La mezcla y el master van incluidos si sobra tiempo en tu sesión.">For rappers, singers and artists recording over their beat. Mix and master included if time remains in your session.</p><span class="price" data-es="$50/hora">$50/hr</span></li>
        <li><h3 data-es="Mezcla y master">Mix &amp; Master</h3><p data-es="Grabado aquí o en otro lado. Master $20.">Recorded here or anywhere. Mastering $20.</p><span class="price" data-es="$30/canción">$30/song</span></li>
        <li><h3 data-es="Bandas y grupos en estudio">Band &amp; Grupo Recording</h3><p data-es="Toda la banda en el estudio, cualquier género. Hasta 4 horas por canción.">Your whole band in the studio, any genre. Up to 4 hours a song.</p><span class="price" data-es="$150/canción">$150/song</span></li>
        <li><h3 data-es="Grabación en vivo">Live Recording</h3><p data-es="Tu banda grabada en vivo, en el estudio o donde toquen. Hasta 4 horas por canción.">Your band recorded live, in the studio or wherever you play. Up to 4 hours a song.</p><span class="price" data-es="$120/canción">$120/song</span></li>
        <li><h3 data-es="Videos musicales en vivo">Live Music Videos</h3><p data-es="Multicámara, como nuestras sesiones En Vivo. Sesión de 2 horas.">Multi-cam, like our En Vivo sessions. 2-hour session.</p><span class="price">$250</span></li>
        <li><h3 data-es="Reels y fotos">Reels &amp; Photos</h3><p data-es="Reel $50 · sesión de fotos de 1 hora $100, con fondo blanco en el estudio.">Reels $50 · 1-hour photo session $100, with a white backdrop in the studio.</p><span class="price" data-es="desde $50">from $50</span></li>
      </ol>
      <p class="also" data-es="También hacemos sonido en vivo para eventos, grabación de podcast y renta del cuarto de ensayo. Pregunta por precio.">We also do live sound for events, podcast recording and rehearsal room rentals. Ask for pricing.</p>
    </section>

    <section class="block block--alt" id="rates">
      <div class="block__head">
        <h2 data-es="Precios">Rates</h2>
        <p class="muted" data-es="Un depósito del 25% aparta tu fecha. La primera sesión tiene descuento.">A 25% deposit holds your date. Your first session is discounted.</p>
      </div>
      <div class="rates">
        <article class="rate">
          <header><h3 data-es="Sesiones de voz">Vocal sessions</h3></header>
          <ul>
            <li><div><b data-es="Voces · 1 hora">Vocals · 1 hour</b><small data-es="Mezcla y master incluidos si sobra tiempo">Mix and master included if time remains</small></div><span class="rate__price">$50</span></li>
            <li><div><b data-es="Voces · 2+ horas">Vocals · 2+ hours</b><small data-es="Mínimo 2 horas, cada hora a $40">2-hour minimum, every hour at $40</small></div><span class="rate__price" data-es="$40<small>/hora</small>">$40<small>/hr</small></span></li>
            <li><div><b data-es="Mezcla">Mixing</b><small data-es="Grabado aquí o en otro lado">Recorded here or anywhere</small></div><span class="rate__price" data-es="$30<small>/canción</small>">$30<small>/song</small></span></li>
            <li><div><b data-es="Master">Mastering</b></div><span class="rate__price" data-es="$20<small>/canción</small>">$20<small>/song</small></span></li>
            <li><div><b data-es="Mezcla y master después de tu sesión">Mix and master after your session</b><small data-es="Si se acabó el tiempo de tu sesión de voz">If your vocal session ran out of time</small></div><span class="rate__price" data-es="$20<small>/canción</small>">$20<small>/song</small></span></li>
          </ul>
          <a href="https://squareup.com/appointments/book/L6PTGPVMKXW8A" target="_blank" rel="noopener" class="btn btn--block" data-track="square_vocals" data-es="Reservar voces">Book vocals</a>
        </article>
        <article class="rate">
          <header><h3 data-es="Bandas y grupos">Bands &amp; grupos</h3></header>
          <ul>
            <li><div><b data-es="Canción en estudio">Studio song</b><small data-es="Hasta 4 horas · luego $40/hora">Up to 4 hours · then $40/hr</small></div><span class="rate__price" data-es="$150<small>/canción</small>">$150<small>/song</small></span></li>
            <li><div><b data-es="Canción en vivo">Live song</b><small data-es="Hasta 4 horas · luego $40/hora">Up to 4 hours · then $40/hr</small></div><span class="rate__price" data-es="$120<small>/canción</small>">$120<small>/song</small></span></li>
            <li><div><b data-es="Hora extra">Extra studio hour</b><small data-es="Después del tiempo incluido">After the included time</small></div><span class="rate__price" data-es="$40<small>/hora</small>">$40<small>/hr</small></span></li>
            <li><div><b data-es="Viaje">Travel</b><small data-es="Si el camino es de más de 45 min">If the drive is over 45 minutes</small></div><span class="rate__price">$50</span></li>
            <li><div><b data-es="Instalación de equipo">Equipment setup</b><small data-es="Para grabar fuera del estudio">For recording outside the studio</small></div><span class="rate__price">$50</span></li>
          </ul>
          <a href="https://squareup.com/appointments/book/L6PTGPVMKXW8A" target="_blank" rel="noopener" class="btn btn--block" data-track="square_grupo" data-es="Reservar banda o grupo">Book a band session</a>
          <button class="rate__quote" data-pick="Grupo studio song" data-track="rate_grupo_quote" data-es="¿Varias canciones o necesitas que viajemos? Pide cotización">Several songs, or need us to travel? Ask for a quote</button>
        </article>
        <article class="rate">
          <header><h3 data-es="Video y fotos">Video &amp; Photo</h3></header>
          <ul>
            <li><div><b data-es="Video musical en vivo">Live music video</b></div><span class="rate__price">$250</span></li>
            <li><div><b>Reel</b><small data-es="De la canción que quieras">Of any song you like</small></div><span class="rate__price">$50</span></li>
            <li><div><b data-es="Sesión de fotos · 1 hora">Photo session · 1 hour</b></div><span class="rate__price">$100</span></li>
          </ul>
          <a href="https://squareup.com/appointments/book/L6PTGPVMKXW8A" target="_blank" rel="noopener" class="btn btn--block" data-track="square_video" data-es="Reservar video o fotos">Book video or photos</a>
        </article>
      </div>
      <p class="rates__note" data-es="Fuera del estudio (grabaciones en vivo y videos) puede aplicar un cargo por la locación, o si necesitas que busquemos una. Te avisamos antes de tu sesión.">Recording outside the studio (live songs and videos) may add a location fee, or a fee if you need us to find a spot. We'll let you know before your session.</p>
      <div class="pay"><span class="pay__label" data-es="Depósito por">Deposits by</span><span class="pay__chip">Zelle</span><span class="pay__chip">Cash App</span><span class="pay__chip">Apple Pay</span><span class="pay__chip" data-es="Efectivo">Cash</span></div>
      <p class="rates__note" data-es="¿Necesitas algo que no está aquí? <a href='#book' class='js-text'>Mándanos un texto</a>.">Need something that isn't listed? <a href="#book" class="js-text">Send us a text</a>.</p>
    </section>

    <section class="block vs">
      <h2 data-es="Antes y después de la mezcla">Before and after the mix</h2>
      <p class="muted" data-es="La misma grabación, cruda y mezclada. Dale play a las dos.">Same recording, raw and mixed. Play both.</p>
      <div class="vs__pair">
        <button class="vid card9" data-tt="7704444897218039071" aria-label="Play mix vs raw"><img src="images/tiktok/7704444897218039071.jpg" alt="" loading="lazy"><span class="play"></span><span class="views">▶ 1.2K</span></button>
        <button class="vid card9" data-tt="7700765015468559647" aria-label="Play before and after"><img src="images/tiktok/7700765015468559647.jpg" alt="" loading="lazy"><span class="play"></span><span class="views">▶ 2.9K</span></button>
      </div>
      <button class="pill pill--solid" data-pick="Mixing / mastering" data-track="mix_book" data-es="Mezclar una canción ($30)">Get a song mixed ($30)</button>
    </section>

    <section class="row" id="work">
      <div class="row__head"><h2 data-es="Trabajo reciente">Recent work</h2><a href="https://www.youtube.com/@SynqStudios" target="_blank" rel="noopener" data-es="Ver en YouTube ↗">Watch on YouTube ↗</a></div>
      <div class="rail rail--wide">
        <button class="vid card16" data-yt="0g0u0fXxJAY" aria-label="Play En Vivo Desde Rancho M Vol. 1"><img src="images/youtube/0g0u0fXxJAY.jpg" alt="" loading="lazy"><span class="play"></span><span class="cap"><strong>En Vivo Desde Rancho M · Vol. 1</strong>Evidente · Los Empresarios · Coronado · Los Preferidos Del Valle</span></button>
        <button class="vid card16" data-yt="whJuTxzYbsA" aria-label="Play Va De Nuez"><img src="images/youtube/whJuTxzYbsA.jpg" alt="" loading="lazy"><span class="play"></span><span class="cap"><strong>Va De Nuez</strong>Los Reservados De Chicago</span></button>
        <button class="vid card16" data-yt="8LcT1H6RfRQ" aria-label="Play Voy Llegando A Tu Ciudad"><img src="images/youtube/8LcT1H6RfRQ.jpg" alt="" loading="lazy"><span class="play"></span><span class="cap"><strong>Voy Llegando A Tu Ciudad</strong>Los Claveles</span></button>
        <button class="vid card16" data-yt="moR9Bx4CJso" aria-label="Play Marlboro Rojo"><img src="images/youtube/moR9Bx4CJso.jpg" alt="" loading="lazy"><span class="play"></span><span class="cap"><strong>Marlboro Rojo</strong>Los Claveles</span></button>
      </div>
      <p class="row__cta"><a href="https://squareup.com/appointments/book/L6PTGPVMKXW8A" target="_blank" rel="noopener" class="pill pill--solid" data-track="square_live" data-es="Reservar un video en vivo ($250)">Book a live video ($250)</a></p>
    </section>

    <section class="row" id="tiktok">
      <div class="row__head"><h2 data-es="Clips del estudio">From the studio</h2><a href="https://www.tiktok.com/@synqstudios" target="_blank" rel="noopener">@synqstudios ↗</a></div>
      <div class="rail">
        <button class="vid card9" data-tt="7683332505428102430"><img src="images/tiktok/7683332505428102430.jpg" alt="" loading="lazy"><span class="play"></span><span class="views">▶ 13.4K</span><span class="cap" data-es="Tour del estudio">Studio tour</span></button>
        <button class="vid card9" data-tt="7700765015468559647"><img src="images/tiktok/7700765015468559647.jpg" alt="" loading="lazy"><span class="play"></span><span class="views">▶ 2.9K</span><span class="cap" data-es="Antes y después de la mezcla">Before &amp; after the mix</span></button>
        <button class="vid card9" data-tt="7690698899966659871"><img src="images/tiktok/7690698899966659871.jpg" alt="" loading="lazy"><span class="play"></span><span class="views">▶ 1.8K</span><span class="cap">Se Les Peló Baltazar</span></button>
        <button class="vid card9" data-tt="7697746982508498207"><img src="images/tiktok/7697746982508498207.jpg" alt="" loading="lazy"><span class="play"></span><span class="views">▶ 1.6K</span><span class="cap" data-es="Detrás de cámara">Behind the camera</span></button>
        <button class="vid card9" data-tt="7698509898446818590"><img src="images/tiktok/7698509898446818590.jpg" alt="" loading="lazy"><span class="play"></span><span class="views">▶ 1.4K</span><span class="cap" data-es="Cualquier género">Any genre</span></button>
        <button class="vid card9" data-tt="7705145530703203614"><img src="images/tiktok/7705145530703203614.jpg" alt="" loading="lazy"><span class="play"></span><span class="views">▶ 977</span><span class="cap">Batallas de aura</span></button>
        <button class="vid card9" data-tt="7706334317819022622"><img src="images/tiktok/7706334317819022622.jpg" alt="" loading="lazy"><span class="play"></span><span class="views">▶ 768</span><span class="cap">Mientras Duermes</span></button>
        <button class="vid card9" data-tt="7698151472164392223"><img src="images/tiktok/7698151472164392223.jpg" alt="" loading="lazy"><span class="play"></span><span class="views">▶ 487</span><span class="cap">Hombre Normal</span></button>
      </div>
    </section>

    <section class="block block--alt artists" aria-label="Artists we've worked with">
      <p class="kicker" data-es="Más de 50 bandas y artistas han grabado aquí">50+ bands and artists have recorded here</p>
      <article class="featured">
        <a class="ep ep--cover" href="https://music.apple.com/us/album/desde-synq-studios-rockford-illinois-live-ep/6819910931" target="_blank" rel="noopener" data-track="ep_cover" aria-label="Listen to Desde Synq Studios Rockford, Illinois (Live) on Apple Music">
          <img src="images/los-serenos-ep.jpg" alt="Los Serenos, Desde Synq Studios Rockford, Illinois (Live) EP cover" width="800" height="800" loading="lazy">
          <span class="ep__play" aria-hidden="true">▶</span>
        </a>
        <div class="featured__text">
          <p class="kicker" data-es="EP en vivo, 2026">Live EP, 2026</p>
          <h2 data-es="Los Serenos vinieron desde California a grabar aquí">Los Serenos came from California to record here</h2>
          <p class="featured__title">“Desde Synq Studios Rockford, Illinois (Live)”</p>
          <p class="muted" data-es="Grabaron su EP en vivo en SYNQ y le pusieron el nombre del estudio. Seis canciones, ya disponibles.">They recorded their live EP at SYNQ and named it after the studio. Six songs, out now.</p>
          <ol class="tracks">
            <li>Sin Fronteras</li><li>Joven Marcial</li><li>Fresas De La Capital</li><li>La Pasadita / La Pava</li><li>El H</li><li>Clavelito Chino Chino</li>
          </ol>
          <div class="hero__cta">
            <a class="pill pill--solid" href="https://music.apple.com/us/album/desde-synq-studios-rockford-illinois-live-ep/6819910931" target="_blank" rel="noopener" data-track="ep_listen" data-es="▶ Escuchar en Apple Music">▶ Listen on Apple Music</a>
            <button class="pill" data-pick="Grupo studio song" data-track="featured_book" data-es="Grabar con tu banda">Record with your band</button>
          </div>
        </div>
      </article>
      <ul class="names">
        <li>Nivel 15</li><li>Grupo Indebido</li><li>Marca Exigente</li><li>Herencia De Rancho</li>
        <li>Gallos De La Sierra</li><li>Contrabando Norteño</li><li>Legado Fino</li><li>Los Reservados De Chicago</li>
        <li class="names__more" data-es="y más de 40 más">and 40+ more</li>
      </ul>
    </section>

    <section class="studio" id="studio">
      <div class="studio__img"><img src="images/studio/mixing-room.jpg" alt="The mixing room at SYNQ Studios in Rockford, Illinois" width="1000" height="1250" loading="lazy"><img src="images/studio/recording-room.jpg" alt="Drum kit in the recording room at SYNQ Studios" width="1000" height="1250" loading="lazy"></div>
      <div class="studio__text">
        <h2 data-es="El estudio">The studio</h2>
        <p class="muted" data-es="Un cuarto de mezcla, un cuarto de grabación con cabina de voz, un cuarto de ensayo, un cuarto de podcast, un cuarto con fondo blanco para fotos y una sala con mesa de billar, en el 4040 Charles St. Si quieres conocerlo antes de reservar, pasa a verlo.">A mixing room, a recording room with a vocal booth, a rehearsal room, a podcast room, a white backdrop room for photos and a pool room, at 4040 Charles St. If you want to see it before you book, come by.</p>
        <div class="hero__cta">
          <button class="pill pill--solid" data-tt="7683332505428102430" data-track="tour_video" data-es="▶ Ver el tour">▶ Watch the tour</button>
          <a href="#book" class="pill" data-pick="Free studio tour" data-track="tour_book" data-es="Agendar una visita">Schedule a visit</a>
        </div>
      </div>
    </section>


    <section class="block block--photo" id="how">
      <div class="block__head"><h2 data-es="Cómo reservar">How booking works</h2></div>
      <ol class="steps">
        <li><h3 data-es="Escoge un horario">Pick a time</h3><p data-es="Reserva en línea, o mándanos un texto.">Book online, or send us a text.</p></li>
        <li><h3 data-es="Manda el depósito">Send the deposit</h3><p data-es="El 25% por Zelle, Cash App, Apple Pay o en efectivo.">25% by Zelle, Cash App, Apple Pay or cash.</p></li>
        <li><h3 data-es="Ven a grabar">Come in and record</h3><p data-es="Nosotros nos encargamos de la mezcla, y del video si lo quieres.">We take care of the mix, and the video if you want one.</p></li>
      </ol>
    </section>

    <section class="block block--alt" id="faq">
      <div class="block__head"><h2 data-es="Preguntas frecuentes">Common questions</h2></div>
      <div class="faq">
        <details><summary data-es="¿Qué tipo de música graban?">What kind of music do you record?</summary><p data-es="Cualquier género. Raperos, cantantes, bandas y grupos graban aquí. Hemos grabado a más de 50 bandas y artistas, incluyendo a Los Serenos, que vinieron desde California a grabar su EP en vivo.">Any genre. Rappers, singers, bands and grupos all record here. We've recorded 50+ bands and artists, including Los Serenos, who came from California to record their live EP.</p></details>
        <details><summary data-es="¿Cuánto cuesta?">How much does it cost?</summary><p data-es="Voces $50 por 1 hora, o $40/hora con mínimo de 2 horas. La mezcla y el master van incluidos si sobra tiempo; si no, $20 por canción después de la sesión. Mezcla sola $30 y master $20 por canción. Bandas y grupos: $150 por canción en estudio o $120 en vivo, hasta 4 horas cada una; la hora extra es $40. Video musical en vivo $250, reel $50, sesión de fotos $100.">Vocals are $50 for 1 hour, or $40/hr with a 2-hour minimum. Mix and master is included if time remains; if not, it's $20 a song after the session. Mixing on its own is $30 and mastering $20 a song. Bands and grupos: $150 a studio song or $120 a live song, up to 4 hours each; extra hours are $40. Live music videos $250, reels $50, photo sessions $100.</p></details>
        <details><summary data-es="¿Necesito dejar depósito?">Do I need a deposit?</summary><p data-es="Sí, el 25% aparta tu fecha. Por ejemplo, una canción de grupo de $150 lleva $37.50 de depósito. Zelle, Cash App, Apple Pay o efectivo.">Yes, 25% locks in your date. For example, a $150 grupo song takes a $37.50 deposit. Zelle, Cash App, Apple Pay or cash.</p></details>
        <details><summary data-es="¿Hablan español?">Do you speak Spanish?</summary><p data-es="Sí. Trabajamos con clientes en español e inglés.">Yes. We work with clients in Spanish and English.</p></details>
        <details><summary data-es="¿Van a donde estemos?">Do you travel?</summary><p data-es="Sí, para grabaciones en vivo y videos. Viaje $50 si el camino es de más de 45 minutos, e instalación de equipo $50. Puede aplicar un cargo por la locación; te avisamos antes de tu sesión.">Yes, for live recordings and videos. Travel is $50 if the drive is over 45 minutes, and equipment setup is $50. A location fee may apply; we'll let you know before your session.</p></details>
        <details><summary data-es="¿Mezclan canciones grabadas en otro lado?">Can you mix a song recorded somewhere else?</summary><p data-es="Sí. Mezcla $30, master $20.">Yes. Mixing $30, mastering $20.</p></details>
        <details><summary data-es="¿Dónde están?">Where are you located?</summary><p data-es="En el 4040 Charles St, Rockford, IL 61108. También trabajamos con artistas en el área de Chicago.">4040 Charles St, Rockford, IL 61108. We also work with artists across the Chicago area.</p></details>
      </div>
    </section>

    <section class="block" id="book">
      <div class="book">
        <div>
          <h2 data-es="Reserva una sesión">Book a session</h2>
          <p class="muted" data-es="La primera sesión tiene descuento.">Your first session is discounted.</p>
          <a class="opentimes" href="https://squareup.com/appointments/book/L6PTGPVMKXW8A" target="_blank" rel="noopener" data-track="square_book_section">
            <span class="opentimes__icon"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <span><strong data-es="Ver horarios disponibles">See open times</strong><small data-es="Escoge día y hora en Square">Pick a day and time on Square</small></span>
            <span class="opentimes__go">→</span>
          </a>
          <p class="muted small" data-es="¿Varias canciones, viaje o algo diferente? Usa el formulario y te mandamos precio.">Several songs, travel, or something different? Use the form and we'll text you a price.</p>
          <dl class="contact">
            <div><dt data-es="Texto">Text</dt><dd><a href="#book" class="js-text" data-track="sms_contact" data-es="Mandar texto ↗">Send a text ↗</a></dd></div>
            <div><dt data-es="Estudio">Studio</dt><dd>4040 Charles St<br>Rockford, IL 61108<br><a href="https://www.google.com/maps/search/?api=1&amp;query=4040+Charles+St%2C+Rockford%2C+IL+61108" target="_blank" rel="noopener" data-track="directions" data-es="Cómo llegar ↗">Get directions ↗</a></dd></div>
            <div><dt>Instagram</dt><dd><a href="https://ig.me/m/synq.studios" target="_blank" rel="noopener" data-es="Mándanos DM ↗">DM us ↗</a></dd></div>
            <div><dt data-es="Idiomas">Languages</dt><dd>English · Español</dd></div>
          </dl>
        </div>
        <!-- Booking quiz. Submissions post to Web3Forms (https://api.web3forms.com/submit), which emails them to you. -->
        <form class="quiz" name="booking" method="POST" action="/" data-netlify="true" netlify-honeypot="bot-field" novalidate>
          <input type="hidden" name="form-name" value="booking">
          <p hidden><label>Leave this empty <input name="bot-field"></label></p>
          <input type="hidden" name="language" value="English">
          <div class="quiz__bar"><span></span></div>
          <fieldset class="quiz__step">
            <legend data-es="¿Qué necesitas?">What do you need?</legend>
            <p class="quiz__hint" data-es="Paso 1 de 4">Step 1 of 4</p>
            <div class="opts">
              <label class="opt"><input type="radio" name="service" value="Vocal recording"><span data-es="Grabar voces">Record vocals</span></label>
              <label class="opt"><input type="radio" name="service" value="Mixing / mastering"><span data-es="Mezcla / master">Mixing / mastering</span></label>
              <label class="opt"><input type="radio" name="service" value="Grupo studio song"><span data-es="Banda o grupo, en estudio">Band or grupo, studio</span></label>
              <label class="opt"><input type="radio" name="service" value="Grupo live song"><span data-es="Banda o grupo, en vivo">Band or grupo, live</span></label>
              <label class="opt"><input type="radio" name="service" value="Live music video"><span data-es="Video en vivo">Live music video</span></label>
              <label class="opt"><input type="radio" name="service" value="Reels"><span>Reels</span></label>
              <label class="opt"><input type="radio" name="service" value="Photo session"><span data-es="Sesión de fotos">Photo session</span></label>
              <label class="opt"><input type="radio" name="service" value="Free studio tour"><span data-es="Visitar el estudio">Visit the studio</span></label>
            </div>
          </fieldset>
          <fieldset class="quiz__step" hidden>
            <legend data-es="¿Quién viene?">Who's coming?</legend>
            <p class="quiz__hint" data-es="Paso 2 de 4">Step 2 of 4</p>
            <div class="opts">
              <label class="opt"><input type="radio" name="group" value="Solo artist"><span data-es="Solista">Solo artist</span></label>
              <label class="opt"><input type="radio" name="group" value="Duo"><span data-es="Dueto">Duo</span></label>
              <label class="opt"><input type="radio" name="group" value="Band/grupo (3-5)"><span data-es="Banda o grupo (3–5)">Band or grupo (3–5)</span></label>
              <label class="opt"><input type="radio" name="group" value="Band/grupo (6+)"><span data-es="Banda o grupo (6+)">Band or grupo (6+)</span></label>
            </div>
          </fieldset>
          <fieldset class="quiz__step" hidden>
            <legend data-es="¿Cuándo?">When?</legend>
            <p class="quiz__hint" data-es="Paso 3 de 4">Step 3 of 4</p>
            <div class="opts">
              <label class="opt"><input type="radio" name="when" value="This week"><span data-es="Esta semana">This week</span></label>
              <label class="opt"><input type="radio" name="when" value="Next 2 weeks"><span data-es="Próximas 2 semanas">Next 2 weeks</span></label>
              <label class="opt"><input type="radio" name="when" value="This month"><span data-es="Este mes">This month</span></label>
              <label class="opt"><input type="radio" name="when" value="Just looking"><span data-es="Solo viendo precios">Just checking prices</span></label>
            </div>
          </fieldset>
          <fieldset class="quiz__step" hidden>
            <legend data-es="¿A dónde te mandamos texto?">Where do we text you?</legend>
            <p class="quiz__hint" data-es="Paso 4 de 4">Step 4 of 4</p>
            <div class="quiz__fields">
              <div class="row2">
                <label class="f"><span data-es="Nombre / Artista / Grupo">Name / Artist / Grupo</span><input type="text" name="name" required autocomplete="name"></label>
                <label class="f"><span data-es="Teléfono (para textos)">Phone (for texts)</span><input type="tel" name="phone" required autocomplete="tel" inputmode="tel"></label>
              </div>
              <label class="f"><span data-es="Instagram o TikTok (opcional)">Instagram or TikTok (optional)</span><input type="text" name="social" placeholder="@yourname" data-es-placeholder="@tunombre"></label>
              <label class="f"><span data-es="¿Algo más? (opcional)">Anything else? (optional)</span><textarea name="message" rows="3" placeholder="Song links, how many songs, event date…" data-es-placeholder="Links, cuántas canciones, fecha del evento…"></textarea></label>
              <label class="check"><input type="checkbox" name="first_session_discount" value="yes" checked> <span data-es="Es mi primera sesión (con descuento)">This is my first session (discounted)</span></label>
            </div>
          </fieldset>
          <p class="quiz__err" role="alert"></p>
          <div class="quiz__nav">
            <button type="button" class="quiz__back" hidden data-es="Atrás">Back</button>
            <button type="submit" class="btn quiz__next">Next</button>
          </div>
          <div class="quiz__done" hidden role="status">
            <h3 class="quiz__done-title"></h3>
            <p class="muted" data-es="Te mandamos texto pronto con horarios y el precio. Un depósito del 25% aparta tu fecha.">We'll text you back soon with times and a price. A 25% deposit holds your date.</p>
            <a class="btn js-text" href="#book" data-track="sms_after_lead" data-es="Mandar texto">Text us</a>
          </div>
        </form>
      </div>
    </section>

    <section class="block textclub">
      <div><h2 data-es="Lista de textos">Text list</h2><p class="muted" data-es="Te avisamos cuando se abre un espacio de último minuto o sale un nuevo En Vivo.">Get a text when a last-minute spot opens up or a new En Vivo comes out.</p></div>
      <!-- Text list signups also post to Web3Forms (https://api.web3forms.com/submit), which emails them to you. -->
      <form class="textclub__form" name="text-list" method="POST" action="/" data-netlify="true" netlify-honeypot="bot-field">
        <input type="hidden" name="form-name" value="text-list">
        <p hidden><label>Leave this empty <input name="bot-field"></label></p>
        <label class="sr-only" for="tc-phone">Phone number</label>
        <input id="tc-phone" type="tel" name="phone" placeholder="Your phone number" data-es-placeholder="Tu número de teléfono" autocomplete="tel" inputmode="tel" required>
        <button class="btn" type="submit" data-es="Unirme">Join</button>
        <p class="textclub__msg" role="status" aria-live="polite"></p>
      </form>
    </section>
  </main>

  <footer class="foot">
    <span><button type="button" class="egg-z" aria-label="Shh…" title="">z</button> © <span id="year"></span> SYNQ Studios · <a href="https://www.google.com/maps/search/?api=1&amp;query=4040+Charles+St%2C+Rockford%2C+IL+61108" target="_blank" rel="noopener">4040 Charles St, Rockford, IL 61108</a></span>
    <span><a href="es.html" hreflang="es" data-es="English version" data-es-href="./">Versión en español</a> · <a href="https://www.instagram.com/synq.studios/" target="_blank" rel="noopener">Instagram</a> · <a href="https://www.tiktok.com/@synqstudios" target="_blank" rel="noopener">TikTok</a> · <a href="https://www.youtube.com/@SynqStudios" target="_blank" rel="noopener">YouTube</a></span>
  </footer>

  <div class="stick" aria-label="Quick booking">
    <a class="btn" href="https://squareup.com/appointments/book/L6PTGPVMKXW8A" target="_blank" rel="noopener" data-track="square_sticky" data-es="Reservar">Book now</a>
    <a class="btn btn--ghost pill js-text" href="#book" data-track="sticky_sms" data-es="Mandar texto">Text us</a>
  </div>

  <dialog class="textdlg" aria-labelledby="textdlg-title">
    <form method="dialog" class="textdlg__form">
      <button type="button" class="textdlg__close" aria-label="Close">✕</button>
      <h3 id="textdlg-title" data-es="Mándanos un texto">Send us a text</h3>
      <p class="muted" data-es="Pon tu nombre y abrimos tu app de mensajes con el texto listo para enviar.">Add your name and we'll open your messages app with the text ready to send.</p>
      <label class="f"><span data-es="Tu nombre">Your name</span><input type="text" name="who" required autocomplete="name"></label>
      <label class="f"><span data-es="Nombre artístico o de tu grupo (opcional)">Artist or grupo name (optional)</span><input type="text" name="act" autocomplete="off"></label>
      <p class="textdlg__err" role="alert"></p>
      <button type="submit" class="btn btn--block" data-track="sms_open" data-es="Abrir mensaje">Open text message</button>
    </form>
  </dialog>
  <dialog class="egg" aria-labelledby="egg-title">
    <div class="egg__card">
      <button type="button" class="egg__close" aria-label="Close">✕</button>
      <p class="kicker" data-es="Lo encontraste">You found him</p>
      <h3 id="egg-title" data-es="Shh… alguien está dormido en el estudio.">Shh… someone's asleep in the studio.</h3>
      <div class="egg__scene">
        <span class="egg__z egg__z--1">z</span><span class="egg__z egg__z--2">z</span><span class="egg__z egg__z--3">Z</span>
        <img class="egg__sleeper" src="images/easter-sleeper.webp" alt="" width="1000" height="439" loading="lazy">
      </div>
      <p class="egg__msg" aria-live="polite"></p>
      <div class="egg__actions">
        <button type="button" class="btn egg__wake">Wake him up</button>
      </div>
      <p class="egg__count muted small"></p>
      <p class="egg__after"><a class="pill egg__book" hidden href="https://squareup.com/appointments/book/L6PTGPVMKXW8A" target="_blank" rel="noopener" data-track="egg_book" data-es="Reserva tu propia sesión">Book your own session</a></p>
    </div>
  </dialog>
  <dialog class="player" aria-label="Video player"><button class="player__close" aria-label="Close video">✕</button><div class="player__frame"></div></dialog>
  {switcher}
  <script data-goatcounter="https://synqstudiosrkfd.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
  <script src="i18n.js"></script>
  <script src="script.js"></script>
  <script src="funnel.js"></script>
  <script src="motion.js"></script>
  <script src="egg.js"></script>
  <script>
    // Top bar turns solid after you scroll past the top of the hero
    (function () {{
      const top = document.querySelector('.top');
      const upd = () => top.classList.toggle('solid', scrollY > 40);
      addEventListener('scroll', upd, {{ passive: true }}); upd();
    }})();
  </script>
</body>
</html>
"""


def switcher(current):
    cur = ' aria-current="page"'
    links = "".join(
        f'<a href="cine-{k}.html"{cur if k == current else ""}>{v["label"]}</a>'
        for k, v in THEMES.items()
    )
    return f'<nav class="ds" aria-label="Cinematic versions">{links}<a href="cinematic.html">All ⊞</a></nav>'


for key, t in THEMES.items():
    page = TEMPLATE.format(gf=GF, fonts=t["fonts"], key=key, hero=t["hero"], switcher=switcher(key))
    (ROOT / f"cine-{key}.html").write_text(page)
    print("built", f"cine-{key}.html")


# ---------- The live site ----------
# SITE is the version you picked. It becomes index.html (no preview switcher), plus a Spanish
# es.html that Google can index. dist/ gets only the files the live site needs.
SITE = "fuego"

# Your public web address, no trailing slash (e.g. "https://synqstudios.com" or
# "https://synq-studios.netlify.app"). Fill it in to turn on the sitemap, canonical and hreflang tags.
SITE_URL = "https://synqstudios815.com"

# Web3Forms access key (free: web3forms.com). Booking requests + text-list signups get emailed to you.
# Leave empty to fall back to Netlify Forms (view submissions in Netlify → Forms).
WEB3FORMS_KEY = "27ca1c93-1469-46f4-a1f9-621038316430"

import html as _html
import json
import re
import shutil
import subprocess

TITLE_EN = "Recording Studio in Rockford, Illinois | SYNQ Studios"
TITLE_ES = "Estudio de Grabación en Rockford, Illinois | SYNQ Studios"
DESC_EN = ("Recording studio in Rockford, IL for any artist. Vocals $50/hr, mixing $30, band recording, "
           "live music videos and photos. Book online.")
DESC_ES = ("Estudio de grabación en Rockford, IL para cualquier artista. Voces $50/hora, mezcla $30, "
           "grabación de bandas, videos en vivo y fotos. Reserva en línea.")

SERVICES = [  # (name, price, unit) for the price info Google reads. Keep in sync with Square.
    ("Vocal session (1 hour)", "50", "hour"), ("Vocal session (2+ hours, 2-hour minimum)", "40", "hour"),
    ("Mix and master after a vocal session", "20", "song"), ("Mixing", "30", "song"), ("Mastering", "20", "song"),
    ("Band / grupo studio song (up to 4 hours)", "150", "song"), ("Band / grupo live song (up to 4 hours)", "120", "song"),
    ("Extra studio hour", "40", "hour"), ("Travel (drive over 45 minutes)", "50", None), ("Equipment setup", "50", None),
    ("Live music video", "250", None), ("Reel", "50", None), ("Photo session (1 hour)", "100", None),
]


def use_web3forms(page):
    """Point both forms at Web3Forms so every submission is emailed to you."""
    if not WEB3FORMS_KEY:
        return page
    for name, subject in (("booking", "New booking request from the SYNQ website"),
                          ("text-list", "New text list signup (SYNQ website)")):
        page = page.replace(
            f'name="{name}" method="POST" action="/" data-netlify="true" netlify-honeypot="bot-field"',
            f'name="{name}" method="POST" action="https://api.web3forms.com/submit"')
        page = page.replace(
            f'<input type="hidden" name="form-name" value="{name}">',
            f'<input type="hidden" name="form-name" value="{name}">\n'
            f'          <input type="hidden" name="access_key" value="{WEB3FORMS_KEY}">\n'
            f'          <input type="hidden" name="subject" value="{subject}">\n'
            f'          <input type="hidden" name="from_name" value="SYNQ Studios website">\n'
            f'          <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">')
    return page


def seo(page):
    esc = lambda v: _html.escape(v, quote=True)
    # Title + description, in both languages (i18n.js swaps them)
    page = re.sub(r"<title>.*?</title>", f"<title>{esc(TITLE_EN)}</title>", page, count=1)
    page = re.sub(r'<meta name="description" content="[^"]*">',
                  f'<meta name="description" content="{esc(DESC_EN)}" data-es-content="{esc(DESC_ES)}">', page, count=1)
    page = page.replace('<meta property="og:title" content="SYNQ Studios 🏆 Rockford · Chicago">',
                        f'<meta property="og:title" content="{esc(TITLE_EN)}" data-es-content="{esc(TITLE_ES)}">\n'
                        f'  <meta property="og:description" content="{esc(DESC_EN)}" data-es-content="{esc(DESC_ES)}">\n'
                        '  <meta property="og:type" content="website">')
    # Canonical / hreflang / og:url — only once we know the public address
    if SITE_URL:
        u = SITE_URL.rstrip("/")
        head = (f'  <link rel="canonical" href="{u}/" data-es-href="{u}/es.html">\n'
                f'  <link rel="alternate" hreflang="en" href="{u}/">\n'
                f'  <link rel="alternate" hreflang="es" href="{u}/es.html">\n'
                f'  <link rel="alternate" hreflang="x-default" href="{u}/">\n'
                f'  <meta property="og:url" content="{u}/" data-es-content="{u}/es.html">\n')
        page = page.replace('  <meta property="og:image" content="images/og-share.jpg">',
                            head + f'  <meta property="og:image" content="{u}/images/og-share.jpg">')
    # Keep markup inside data-es attributes escaped (cleaner HTML for crawlers)
    page = re.sub(r'data-es="([^"]*)"', lambda m: 'data-es="' + m.group(1).replace("<", "&lt;").replace(">", "&gt;") + '"', page)
    # Empty heading filled by JS → plain text
    page = page.replace('<h3 class="quiz__done-title"></h3>', '<p class="quiz__done-title"></p>')
    # Image sizes (prevents layout jumps) + descriptions for video thumbnails
    page = re.sub(r'<img src="images/tiktok/([^"]+)" alt=""(?![^>]*width)', r'<img src="images/tiktok/\1" alt="" width="540" height="960"', page)
    page = re.sub(r'<img src="images/youtube/([^"]+)" alt=""(?![^>]*width)', r'<img src="images/youtube/\1" alt="" width="1280" height="720"', page)
    def alt_for(m):
        btn = m.group(0)
        cap = re.search(r'<span class="cap"[^>]*>(.*?)</span>', btn)
        label = re.search(r'aria-label="([^"]+)"', btn)
        text = re.sub(r"<[^>]+>", " ", cap.group(1)) if cap else (label.group(1) if label else "")
        text = " ".join(_html.unescape(text).split())
        alt = esc(f"{text} – SYNQ Studios, Rockford IL" if text else "Session at SYNQ Studios, Rockford IL")
        return btn.replace('alt=""', f'alt="{alt}"', 1)
    page = re.sub(r'<button class="vid[^"]*"[^>]*>.*?</button>', alt_for, page, flags=re.S)
    # Extra structured data: services with prices + FAQ
    faqs = re.findall(r'<details><summary data-es="[^"]*">(.*?)</summary><p data-es="[^"]*">(.*?)</p></details>', page)
    def offer(n, price, unit):
        o = {"@type": "Offer", "itemOffered": {"@type": "Service", "name": n}, "price": price, "priceCurrency": "USD"}
        if unit:
            o["priceSpecification"] = {"@type": "UnitPriceSpecification", "price": price, "priceCurrency": "USD", "unitText": unit}
        return o
    extra = [
        {"@context": "https://schema.org", "@type": "OfferCatalog", "name": "SYNQ Studios rates",
         "itemListElement": [offer(*x) for x in SERVICES]},
        {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": _html.unescape(q),
             "acceptedAnswer": {"@type": "Answer", "text": _html.unescape(re.sub(r"<[^>]+>", "", a))}} for q, a in faqs]},
    ]
    if SITE_URL:
        extra[0]["url"] = SITE_URL
    ld = "".join(f'\n  <script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in extra)
    page = page.replace("</head>", ld + "\n</head>", 1)
    return page


t = THEMES[SITE]
live = use_web3forms(seo(TEMPLATE.format(gf=GF, fonts=t["fonts"], key=SITE, hero=t["hero"], switcher="")))
(ROOT / "index.html").write_text(live)
print("built index.html  (live site:", t["label"] + ")")

DIST = ROOT / "dist"
if DIST.exists():
    shutil.rmtree(DIST)
needed = {"index.html", "i18n.js", "script.js", "funnel.js", "motion.js", "egg.js", "layouts/base.css", "layouts/cine.css", f"layouts/cine-{SITE}.css"}
needed |= set(re.findall(r'(?:src|href|content)="(images/[^"]+)"', live)) | {"images/og-share.jpg"}
for rel in sorted(needed):
    dest = DIST / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / rel, dest)

# robots.txt + sitemap.xml
robots = "User-agent: *\nAllow: /\nDisallow: /dash/\n"
if SITE_URL:
    u = SITE_URL.rstrip("/")
    robots += f"\nSitemap: {u}/sitemap.xml\n"
    (DIST / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "".join(
            f'  <url><loc>{u}/{path}</loc>'
            f'<xhtml:link rel="alternate" hreflang="en" href="{u}/"/>'
            f'<xhtml:link rel="alternate" hreflang="es" href="{u}/es.html"/></url>\n'
            for path in ("", "es.html"))
        + f'  <url><loc>{u}/trajes/</loc></url>\n'
        + "</urlset>\n")
(DIST / "robots.txt").write_text(robots)
# Suit designer at /trajes/
TRAJES = DIST / "trajes"
TRAJES.mkdir(parents=True, exist_ok=True)
for f in ["index.html", "trajes.css", "app.js", "studio.js", "vendor/three.module.min.js", "vendor/OrbitControls.js",
          "vendor/DecalGeometry.js", "vendor/RoomEnvironment.js", "vendor/three-LICENSE.txt"]:
    (TRAJES / f).parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / "trajes" / f, TRAJES / f)
(DIST / "images").mkdir(exist_ok=True)
shutil.copy2(ROOT / "images" / "synq-mark.png", DIST / "images" / "synq-mark.png")

# Phone dashboard at /dash/ (the page code only; your numbers stay locked with your passcode)
DASH = DIST / "dash"
(DASH / "vendor").mkdir(parents=True, exist_ok=True)
shutil.copy2(ROOT / "mac-dashboard" / "dashboard.html", DASH / "index.html")
for f in ["logo.png", "logo-edge.png", "icon-180.png", "icon-192.png", "icon-512.png", "manifest.webmanifest",
          "vendor/nacl-fast.min.js", "vendor/scrypt.js", "vendor/README.txt"]:
    shutil.copy2(ROOT / "mac-dashboard" / f, DASH / f)
# GitHub Pages: custom domain + serve files as-is (no Jekyll processing)
(DIST / "CNAME").write_text("synqstudios815.com\n")
(DIST / ".nojekyll").write_text("")

# Custom 404 page for GitHub Pages. Absolute paths so it works at any URL depth.
NOT_FOUND = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Page not found | SYNQ Studios</title>
  <link rel="icon" href="/images/synq-logo.jpg">
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/layouts/base.css">
  <link rel="stylesheet" href="/layouts/cine.css">
  <link rel="stylesheet" href="/layouts/cine-fuego.css">
  <style>
    .nf { min-height: 100svh; display: grid; place-items: center; text-align: center; padding: 120px var(--pad) 60px;
          background: radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,59,31,.14), transparent 70%); }
    .nf__code { font-family: var(--font-display); font-size: clamp(6rem, 22vw, 12rem); line-height: .9; color: var(--accent); margin: 0; }
    .nf h1 { font-size: clamp(1.8rem, 5vw, 3rem); margin: .4em 0 .1em; }
    .nf__es { font-family: var(--font-display); text-transform: uppercase; font-size: clamp(1.2rem, 3.4vw, 1.9rem); color: var(--muted); margin: 0 0 1.2rem; }
    .nf p.muted { max-width: 520px; margin: 0 auto .4rem; }
    .nf .hero__cta { justify-content: center; margin-top: 1.8rem; }
  </style>
<script data-goatcounter="https://synqstudiosrkfd.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
</head>
<body class="cine cine--fuego">
  <header class="top solid">
    <a href="/" class="brand"><img src="/images/synq-mark.png" alt="" width="22" height="26"><span>SYNQ STUDIOS</span></a>
    <a href="https://squareup.com/appointments/book/L6PTGPVMKXW8A" target="_blank" rel="noopener" class="pill pill--solid">Book</a>
  </header>
  <main class="nf">
    <div>
      <p class="nf__code">404</p>
      <h1>Page not found</h1>
      <p class="nf__es" lang="es">Página no encontrada</p>
      <p class="muted">This page doesn't exist or has moved.</p>
      <p class="muted" lang="es">Esta página no existe o se movió.</p>
      <div class="hero__cta">
        <a href="/" class="pill pill--solid">Home</a>
        <a href="/es.html" class="pill" lang="es">Página en español</a>
        <a href="https://squareup.com/appointments/book/L6PTGPVMKXW8A" target="_blank" rel="noopener" class="pill">Book a session / Reservar</a>
      </div>
    </div>
  </main>
</body>
</html>
"""
(DIST / "404.html").write_text(NOT_FOUND)
# Small marker so you can check which version is live: https://synqstudios815.com/version.txt
import datetime as _dt
(DIST / "version.txt").write_text(f"SYNQ Studios website, last updated {_dt.datetime.now(_dt.timezone.utc):%Y-%m-%d %H:%M} UTC\n")

# Spanish page Google can read: render index.html in Spanish and save it as es.html
r = subprocess.run(["node", str(ROOT / "prerender-es.js"), str(DIST / "index.html"), str(DIST / "es.html")],
                   capture_output=True, text=True)
if r.returncode == 0:
    # Spanish FAQ for the structured data on es.html
    es_page = (DIST / "es.html").read_text()
    faqs_es = re.findall(r'<summary data-es="([^"]*)"[^>]*>.*?</summary><p data-es="([^"]*)"', live, flags=re.S)
    faq_es = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": _html.unescape(q),
         "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"<[^>]+>", "", _html.unescape(a))}} for q, a in faqs_es]}
    es_page = re.sub(r'<script type="application/ld\+json">\{"@context": "https://schema.org", "@type": "FAQPage".*?</script>',
                     lambda m: '<script type="application/ld+json">' + json.dumps(faq_es, ensure_ascii=False) + '</script>',
                     es_page, count=1, flags=re.S)
    (DIST / "es.html").write_text(es_page)
    shutil.copy2(DIST / "es.html", ROOT / "es.html")
    print("built es.html (Spanish page)")
else:
    print("WARNING: es.html not built:", r.stderr.strip()[:300])
print(f"dist/ ready: {sum(1 for f in DIST.rglob('*') if f.is_file())} files" + ("" if SITE_URL else "  (set SITE_URL to add sitemap + canonical)"))
