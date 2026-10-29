import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AUDIO_PACING } from "./audioPacing";
import { speechAudioPath, speechSlowAudioPath } from "./speechFiles";

describe("AUDIO_PACING", () => {
  it("Sound-talk 的間隔落在慢速範圍（0.9–1.2 秒；連起來念約 0.25 秒）", () => {
    expect(AUDIO_PACING.soundTalkGapMs).toBeGreaterThanOrEqual(900);
    expect(AUDIO_PACING.soundTalkGapMs).toBeLessThanOrEqual(1200);
    expect(AUDIO_PACING.blend.runTogetherGap).toBeGreaterThanOrEqual(200);
    expect(AUDIO_PACING.blend.beforeWord).toBeGreaterThanOrEqual(700);
  });
  it("慢速音素：播兩次、中間隔 1 秒", () => {
    expect(AUDIO_PACING.slowPhoneme).toEqual({ repeats: 2, gapMs: 1000 });
  });
});

describe("speech_slow 檔案", () => {
  it("路徑與一般版不同", () => {
    expect(speechSlowAudioPath("sat")).not.toBe(speechAudioPath("sat"));
    expect(speechSlowAudioPath("sat")).toContain("/audio/speech_slow/");
  });
  it("每個一般語音檔都有對應的慢速檔", () => {
    const root = join(process.cwd(), "public/audio");
    const normal = readdirSync(join(root, "speech"));
    for (const f of normal) expect(existsSync(join(root, "speech_slow", f))).toBe(true);
  });
});
