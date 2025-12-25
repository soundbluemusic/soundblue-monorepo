<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html>
      <head>
        <title>
          <xsl:choose>
            <xsl:when test="sitemap:sitemapindex">Sitemap Index - Tools</xsl:when>
            <xsl:otherwise>Sitemap - Tools</xsl:otherwise>
          </xsl:choose>
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          :root {
            --bg: #ffffff;
            --text: #1a1a1a;
            --text-muted: #666666;
            --border: #e5e5e5;
            --link: #2563eb;
            --link-hover: #1d4ed8;
            --en-badge: #22c55e;
            --ko-badge: #eab308;
            --header-bg: #f8fafc;
            --group-bg: #fafafa;
          }

          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0f172a;
              --text: #f1f5f9;
              --text-muted: #94a3b8;
              --border: #334155;
              --link: #60a5fa;
              --link-hover: #93c5fd;
              --header-bg: #1e293b;
              --group-bg: #1e293b;
            }
          }

          * { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            padding: 2rem 1rem;
          }

          .container { max-width: 1000px; margin: 0 auto; }

          h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }

          .subtitle {
            color: var(--text-muted);
            margin-bottom: 2rem;
            font-size: 0.875rem;
          }

          .subtitle a { color: var(--link); text-decoration: none; }
          .subtitle a:hover { text-decoration: underline; }

          .info-box {
            background: var(--header-bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
            color: var(--text-muted);
          }

          .info-box a { color: var(--link); text-decoration: none; }
          .info-box a:hover { text-decoration: underline; }

          table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }

          th {
            text-align: left;
            padding: 0.75rem 1rem;
            background: var(--header-bg);
            border-bottom: 2px solid var(--border);
            font-weight: 600;
          }

          td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
          }

          tr:hover td { background: var(--header-bg); }

          /* URL Group - EN/KO pair */
          .url-group {
            background: var(--group-bg);
            border-radius: 8px;
            margin-bottom: 0.75rem;
            overflow: hidden;
            border: 1px solid var(--border);
          }

          .url-group:hover {
            border-color: var(--link);
          }

          .url-row {
            display: flex;
            align-items: center;
            padding: 0.625rem 1rem;
            gap: 0.75rem;
          }

          .url-row:not(:last-child) {
            border-bottom: 1px dashed var(--border);
          }

          a { color: var(--link); text-decoration: none; word-break: break-all; }
          a:hover { color: var(--link-hover); text-decoration: underline; }

          .badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 32px;
            padding: 0.125rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.6875rem;
            font-weight: 600;
            text-transform: uppercase;
            flex-shrink: 0;
          }

          .badge-en { background: var(--en-badge); color: white; }
          .badge-ko { background: var(--ko-badge); color: #1a1a1a; }

          .url-link { flex: 1; }

          .url-meta {
            font-size: 0.75rem;
            color: var(--text-muted);
            display: flex;
            gap: 1rem;
            flex-shrink: 0;
          }

          .stats {
            margin-top: 2rem;
            padding: 1rem;
            background: var(--header-bg);
            border-radius: 0.5rem;
            font-size: 0.875rem;
            color: var(--text-muted);
          }

          .section-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border);
          }

          @media (max-width: 640px) {
            body { padding: 1rem 0.5rem; }
            th, td { padding: 0.5rem; }
            .hide-mobile { display: none; }
            .url-row { flex-wrap: wrap; }
            .url-meta { width: 100%; margin-top: 0.25rem; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <xsl:choose>
            <xsl:when test="sitemap:sitemapindex">
              <xsl:call-template name="sitemapindex" />
            </xsl:when>
            <xsl:otherwise>
              <xsl:call-template name="urlset" />
            </xsl:otherwise>
          </xsl:choose>
        </div>
      </body>
    </html>
  </xsl:template>

  <!-- Sitemap Index Template -->
  <xsl:template name="sitemapindex">
    <h1>Sitemap Index</h1>
    <p class="subtitle">
      <a href="https://tools.soundbluemusic.com">tools.soundbluemusic.com</a>
    </p>

    <div class="info-box">
      This sitemap index contains <strong><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)" /></strong> sitemaps.
      Learn more at <a href="https://sitemaps.org" target="_blank" rel="noopener">sitemaps.org</a>.
    </div>

    <table>
      <thead>
        <tr>
          <th>Sitemap</th>
          <th class="hide-mobile">Last Modified</th>
        </tr>
      </thead>
      <tbody>
        <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
          <tr>
            <td>
              <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc" /></a>
            </td>
            <td class="hide-mobile"><xsl:value-of select="sitemap:lastmod" /></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>

    <div class="stats">
      Total: <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)" /> sitemaps
    </div>
  </xsl:template>

  <!-- URL Set Template - Groups EN/KO together -->
  <xsl:template name="urlset">
    <h1>Sitemap</h1>
    <p class="subtitle">
      <a href="https://tools.soundbluemusic.com">tools.soundbluemusic.com</a>
    </p>

    <div class="info-box">
      This sitemap contains <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)" /></strong> URLs with multilingual support (English &amp; Korean).
      Each page is available in both languages. Learn more at <a href="https://sitemaps.org" target="_blank" rel="noopener">sitemaps.org</a>.
    </div>

    <div class="section-title">Pages (EN/KO Pairs)</div>

    <!-- Group URLs by their base path (without /ko/) -->
    <xsl:for-each select="sitemap:urlset/sitemap:url[not(contains(sitemap:loc, '/ko'))]">
      <xsl:variable name="enUrl" select="sitemap:loc" />
      <xsl:variable name="koUrl">
        <xsl:for-each select="xhtml:link[@hreflang='ko']">
          <xsl:value-of select="@href" />
        </xsl:for-each>
      </xsl:variable>

      <div class="url-group">
        <!-- English URL -->
        <div class="url-row">
          <span class="badge badge-en">EN</span>
          <a class="url-link" href="{$enUrl}"><xsl:value-of select="$enUrl" /></a>
          <div class="url-meta hide-mobile">
            <span><xsl:value-of select="sitemap:priority" /></span>
            <span><xsl:value-of select="sitemap:changefreq" /></span>
          </div>
        </div>
        <!-- Korean URL -->
        <xsl:if test="$koUrl != ''">
          <div class="url-row">
            <span class="badge badge-ko">KO</span>
            <a class="url-link" href="{$koUrl}"><xsl:value-of select="$koUrl" /></a>
            <div class="url-meta hide-mobile">
              <span><xsl:value-of select="sitemap:priority" /></span>
              <span><xsl:value-of select="sitemap:changefreq" /></span>
            </div>
          </div>
        </xsl:if>
      </div>
    </xsl:for-each>

    <div class="stats">
      Total: <xsl:value-of select="count(sitemap:urlset/sitemap:url)" /> URLs
      (<xsl:value-of select="count(sitemap:urlset/sitemap:url[not(contains(sitemap:loc, '/ko'))])" /> page pairs)
    </div>
  </xsl:template>

</xsl:stylesheet>
