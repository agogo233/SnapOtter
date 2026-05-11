import { describe, expect, it } from "vitest";
import { validateFetchUrl } from "../../../apps/api/src/lib/ssrf.js";

describe("validateFetchUrl", () => {
  it("allows valid public HTTP URL", async () => {
    await expect(
      validateFetchUrl("https://images.unsplash.com/photo.jpg"),
    ).resolves.toBeUndefined();
  });

  it("allows valid public HTTP URL without TLS", async () => {
    await expect(validateFetchUrl("http://example.com/image.png")).resolves.toBeUndefined();
  });

  it("rejects non-HTTP schemes", async () => {
    await expect(validateFetchUrl("ftp://example.com/image.jpg")).rejects.toThrow(
      "Only HTTP and HTTPS",
    );
    await expect(validateFetchUrl("file:///etc/passwd")).rejects.toThrow("Only HTTP and HTTPS");
    await expect(validateFetchUrl("data:image/png;base64,abc")).rejects.toThrow(
      "Only HTTP and HTTPS",
    );
  });

  it("rejects localhost and loopback", async () => {
    await expect(validateFetchUrl("http://127.0.0.1/image.jpg")).rejects.toThrow("private");
    await expect(validateFetchUrl("http://localhost/image.jpg")).rejects.toThrow("private");
    await expect(validateFetchUrl("http://[::1]/image.jpg")).rejects.toThrow("private");
  });

  it("rejects private network ranges", async () => {
    await expect(validateFetchUrl("http://10.0.0.1/image.jpg")).rejects.toThrow("private");
    await expect(validateFetchUrl("http://172.16.0.1/image.jpg")).rejects.toThrow("private");
    await expect(validateFetchUrl("http://192.168.1.1/image.jpg")).rejects.toThrow("private");
  });

  it("rejects link-local addresses", async () => {
    await expect(validateFetchUrl("http://169.254.169.254/latest/meta-data/")).rejects.toThrow(
      "private",
    );
  });

  it("rejects invalid URLs", async () => {
    await expect(validateFetchUrl("not-a-url")).rejects.toThrow();
    await expect(validateFetchUrl("")).rejects.toThrow();
  });
});
