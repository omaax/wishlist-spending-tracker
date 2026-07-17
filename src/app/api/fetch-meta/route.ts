import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const resolveUrl = (src: string) => {
    if (src.startsWith("//")) return `https:${src}`;
    if (src.startsWith("/") && url) return new URL(src, url).href;
    return src;
  };

  async function fetchAsDataURL(imgUrl: string): Promise<{ blob: string; filename: string } | null> {
    try {
      const res = await fetch(imgUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(10000),
      });
      const buffer = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get("content-type") || "image/jpeg";
      const filename = imgUrl.split("/").pop()?.split("?")[0] || "product-image";
      return {
        blob: `data:${contentType};base64,${buffer.toString("base64")}`,
        filename,
      };
    } catch {
      return null;
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    const html = await response.text();

    const imageUrls: string[] = [];

    const ogRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi;
    let match;
    while ((match = ogRegex.exec(html)) !== null) {
      const img = resolveUrl(match[1]);
      if (img && !imageUrls.includes(img)) imageUrls.push(img);
    }

    const twitterRegex = /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/gi;
    while ((match = twitterRegex.exec(html)) !== null) {
      const img = resolveUrl(match[1]);
      if (img && !imageUrls.includes(img)) imageUrls.push(img);
    }

    if (imageUrls.length === 0) {
      const amazonRegex = /"hiRes":"([^"]+)"|"large":"([^"]+)"|data-old-hires="([^"]+)"|data-a-dynamic-image='([^']+)'/g;
      while ((match = amazonRegex.exec(html)) !== null) {
        const raw = match[1] ?? match[2] ?? match[3] ?? match[4]?.split(",")[0]?.trim().slice(1, -1) ?? "";
        const img = resolveUrl(raw);
        if (img && !imageUrls.includes(img)) imageUrls.push(img);
      }
    }

    if (imageUrls.length === 0) {
      const imgRegex = /<img[^>]+(?:src|data-src|data-lazy-src)=["']([^"']+\.(?:jpg|jpeg|png|webp|gif))["']/gi;
      while ((match = imgRegex.exec(html)) !== null) {
        const img = resolveUrl(match[1]);
        if (img && !imageUrls.includes(img)) imageUrls.push(img);
      }
    }

    if (imageUrls.length === 0) {
      const anyImgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
      while ((match = anyImgRegex.exec(html)) !== null) {
        const img = resolveUrl(match[1]);
        if (img && !imageUrls.includes(img)) imageUrls.push(img);
      }
    }

    const ogTitle = html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
    );
    const titleTag = html.match(/<title>([^<]*)<\/title>/i);

    const price =
      html.match(/<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      html.match(/["']price["']\s*:\s*"?([\d,.]+)"?/)?.[1] ??
      html.match(/<span[^>]+class=["'][^"']*price[^"']*["'][^>]*>([^<]+)/i)?.[1] ??
      null;

    const category =
      html.match(/<meta[^>]+property=["']product:category["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      html.match(/"productCategory"\s*:\s*"([^"]+)"/)?.[1] ??
      html.match(/<meta[^>]+property=["']article:section["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      null;

    const imagePromises = imageUrls.slice(0, 5).map(fetchAsDataURL);
    const results = await Promise.allSettled(imagePromises);
    const fetchedImages = results
      .filter((r) => r.status === "fulfilled" && r.value !== null)
      .map((r) => (r as PromiseFulfilledResult<{ blob: string; filename: string }>).value!);

    return NextResponse.json({
      images: fetchedImages,
      title: ogTitle?.[1] ?? titleTag?.[1] ?? null,
      price,
      category,
    });
  } catch {
    return NextResponse.json({ images: [], title: null, price: null, category: null });
  }
}
