import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

test("varunya branding: en.json contains zero customer-facing Mailflare occurrences", () => {
	const enContent = readFileSync(join(root, "src/lib/i18n/en.json"), "utf8");
	const matches = enContent.match(/Mailflare/g) || [];
	assert.equal(matches.length, 0, `Expected 0 Mailflare occurrences in en.json, found ${matches.length}`);
});

test("varunya branding: update system points to fork repository", () => {
	const updateUtils = readFileSync(join(root, "src/app/api/admin/update/utils.ts"), "utf8");
	assert.match(updateUtils, /UPDATE_SOURCE_REPOSITORY = "Bhuvan2402-bhuvan\/mail"/);
	assert.match(updateUtils, /"User-Agent": "varunya-mail"/);
});

test("varunya branding: sidebar footer displays Varunya Mail and preserves AGPL-3.0 source link", () => {
	const sidebarFooter = readFileSync(join(root, "src/components/sidebar-footer.tsx"), "utf8");
	assert.match(sidebarFooter, /Varunya Mail v\{packageJson\.version\}/);
	assert.match(sidebarFooter, /Your email\. Your workspace\./);
	assert.match(sidebarFooter, /https:\/\/github\.com\/Bhuvan2402-bhuvan\/mail/);
	assert.match(sidebarFooter, /Source Code \(AGPL-3\.0\)/);
});

test("varunya branding: calendar and notification feeds identify as Varunya Mail", () => {
	const calendarFeed = readFileSync(join(root, "src/app/api/calendar/feed/route.ts"), "utf8");
	assert.match(calendarFeed, /\{ name: "Varunya Mail" \}/);
	assert.match(calendarFeed, /filename="varunya-mail\.ics"/);

	const nativePush = readFileSync(join(root, "src/lib/push/native.ts"), "utf8");
	assert.match(nativePush, /title: "Varunya Mail"/);
});

test("varunya branding: database default appName 'Mailflare' normalizes to 'Varunya Mail'", () => {
	const brandingService = readFileSync(join(root, "src/lib/branding/service.ts"), "utf8");
	assert.match(brandingService, /DEFAULT_APP_NAME = "Varunya Mail"/);
	assert.match(brandingService, /!rawName \|\| rawName === "Mailflare"/);
});

test("varunya branding: calendar feeds, webhooks, backups and assistant identify as Varunya Mail", () => {
	const feed = readFileSync(join(root, "src/lib/calendar/feed.ts"), "utf8");
	assert.match(feed, /PRODID:-\/\/Varunya Mail\/\/Calendar\/\/EN/);

	const invite = readFileSync(join(root, "src/lib/calendar/invite.ts"), "utf8");
	assert.match(invite, /PRODID:-\/\/Varunya Mail\/\/Calendar\/\/EN/);

	const calUtils = readFileSync(join(root, "src/lib/calendar/utils.ts"), "utf8");
	assert.match(calUtils, /PRODID:-\/\/Varunya Mail\/\/Calendar\/\/EN/);

	const webhook = readFileSync(join(root, "src/lib/email/webhooks.ts"), "utf8");
	assert.match(webhook, /subject: "Varunya Mail test delivery"/);

	const backup = readFileSync(join(root, "src/lib/backups/export.ts"), "utf8");
	assert.match(backup, /not a valid Varunya Mail backup/);

	const agentTools = readFileSync(join(root, "src/lib/agent/tools.ts"), "utf8");
	assert.match(agentTools, /Open the draft in Varunya Mail to review delivery/);

	const calTools = readFileSync(join(root, "src/lib/calendar/tools.ts"), "utf8");
	assert.match(calTools, /review and approve it in Varunya Mail/);
});
