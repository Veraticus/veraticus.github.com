---
title: "Dashboards Are Already Dead"
date: 2026-03-28 12:00:00 -0500
tags: [ai, business]
---
I built a [gaming companion](https://savecraft.gg) that parses save files, computes drop rates, scores draft picks across 31 archetypes, and gives you advice tailored to your exact character state. It has no dashboard; it doesn't need one, and I hope by the end of this essay to convince you that you don't need one either.

Instead, you talk to Savecraft, and it talks back, and when the reply needs visual structure -- a comparison grid, a scoring timeline, a farming plan -- it renders a view inline, right there in the conversation. Then you keep talking.

I didn't skip the dashboard because I ran out of time (I didn't) or because I'm a backend engineer who hates CSS (I am). I skipped it because dashboards are boring. They are steaming piles of pre-answered questions that your users don't actually care about, lovingly arranged into tabs by someone who thought they knew what people would want to look at. They didn't. You don't either. Neither do I, frankly, and I've been doing this awhile now!

None of us know what users care about -- not really, not the specific questions they'll ask on a Tuesday night when their colony is burning and they need to know whether to fight or flee. You can guess, and your guesses become tabs and filters and settings pages, and some of those guesses will even be correct! Congratulations. But the interesting questions -- the ones where your software actually earns its keep -- are always the ones you never anticipated. Your users should be able to express their intent and be guided to answers, not forced to hunt through screens hoping the right one exists. That's what LLMs do. And that's why I think Savecraft represents something bigger than a niche gaming tool: it's what application development looks like when you stop building views and start building conversations.

## The Pre-Answered Question Problem

Every dashboard you've ever used is a collection of answers to questions a designer anticipated. Someone sat in a room and thought: "The user will probably want to see their character's stats. And their inventory. And maybe a graph of their DPS over time." Then they built screens for those things, organized them into tabs, and shipped it. And if you're lucky, one of those tabs has what you're actually looking for. If you're not lucky, well, that's what the search bar is for. (Assuming it works.)

This arrangement is fine when the questions are predictable -- your bank balance, your email inbox, the weather. Stable queries against stable data, the kind of thing where the designer can reasonably anticipate what you want because everyone wants roughly the same thing.

But a RimWorld player doesn't ask "what are my colonists' stats?" They ask "am I ready for the next raid?" Answering that requires reading the combat roster, checking weapon quality, noticing that your best shooter is pregnant and will be bedridden in three days, flagging that you have zero turrets despite 33,000 colony wealth, and synthesizing all of that into an honest assessment. No dashboard designer anticipated that question. No combination of screens and filters produces that answer -- you'd need to visit four different tabs, hold all the numbers in your head, and do the math yourself. Or more likely not -- you read the wiki, pray you comprehend a bit of it, and then get shocked by mechanics anyway.

The dashboard gives you raw ingredients and then says "good luck interpreting this!" That's not a product. That's a chore with a nice color scheme, and I am TIRED of building chores.

## The Conversation Does the Cooking

Savecraft does something different -- something that feels reckless even now that I am committed to it. The player says "am I ready for the next raid?" and the AI reads their save file -- their actual save file, parsed and structured -- pulls the combat roster, cross-references colony wealth against raid point scaling, checks for vulnerabilities, and gives them an answer: an answer, with reasoning, tailored to their specific situation, delivered like a friend who's played a thousand hours more than you have and is trying to keep you alive.

![Savecraft analyzing a RimWorld colony's raid readiness -- combat roster with skill ratings, Vally flagged as pregnant and non-combatant, zero turrets, zero traps, raid threat points calculated from colony wealth](/images/savecraft-raid-readiness.png)

When the answer benefits from structure, it renders a view -- the AI's synthesis made visual, laid out in a way that text alone can't match. But the AI decided what to show. The player didn't have to know what to ask for, didn't have to know which screen to navigate to, didn't even have to know that colony wealth affects raid scaling in the first place. The AI knew, because knowing is, well, like, what they do.

Dashboards cannot do this. Not "dashboards are bad at this" -- no, cannot. A dashboard shows you what it was built to show you, nothing more and nothing less, regardless of what you actually needed in that moment -- it is a fixed lens pointed at a moving target, and no amount of redesigning the lens changes the fact that it doesn't move. An LLM reads your state, applies judgment, and tells you what you need to know. The question becomes the interface. The interface, for the first time in the entire history of software, is smart enough to keep up with the person using it.

## "But What About Power Users?"

Most "complex workflows" are complex because the UI makes them complex, not because the underlying question is hard. I contend no one actually wants to configure six filters and three sort orders and then squint at the resulting table hoping they set everything up correctly -- we all want the answer those filters would give you, immediately, expressed in natural language. "Show me my underperforming units sorted by potential" is a sentence, a thought that takes three seconds to express. In a dashboard it's a four-click workflow through a builder interface that some product manager spent a quarter designing and that you will spend five minutes relearning every single time you use it. What a magnificent waste of time!

Now. The genuinely complex stuff -- work where exploration and manipulation are the point, where the human's creative judgment **is** the product -- that isn't going anywhere. Photoshop needs a UI. Ableton needs a UI. Games themselves need a UI. I'm not arguing that all interfaces die. (Yet.)

I AM arguing that the information retrieval layer -- the part where you navigate to a screen, read some data, and make a decision -- is the part that gets eaten, wholly and bodily consumed, like Cronos devouring his children. And if you think about it honestly, for even a moment, that layer is most of enterprise software. It's most of what we build. It's most of what we've BEEN building, for thirty years, with such care and craftsmanship and gorgeous design system; and I think most of it is about to become obsolete.

## The Web Is a Historical Accident

Here's the more aggressive version of this argument, the one I think is true even though it makes me a little uncomfortable to say out loud: the web as an information medium is a historical accident of text being cheap to transmit. We built an entire economy around "go to a URL, read some text, click some links" because that's what bandwidth and computing power permitted in 1995, and then we spent thirty years elaborating on that interaction pattern -- making it prettier, making it faster, making it responsive, adding dark mode -- without ever stopping to ask whether the fundamental premise was right.

It wasn't. Most people, most of the time, don't want to read. They want to **know**. They want to ask someone and get actionable information, correct or not.

The difference matters more than you'd think. Reading is a means to knowing, and it's a lossy, inefficient one -- you have to find the right page, scan for the relevant section, extract the pertinent facts, and apply them to your specific situation, all while filtering out the SEO garbage and the cookie banners and the newsletter popups and the chat widget that pops up to ask if you need help finding anything and also to like and subscribe. That is an astonishing amount of cognitive overhead for "should I use a fire resist amulet here?"

Voice assistants almost got this right a decade ago but they were too stupid to be useful -- they could answer factual queries and set timers, and Cronos bless them for that, but they couldn't synthesize, couldn't reason, couldn't take three pieces of context and produce a judgment. LLMs can. Now, suddenly, the interface that matches how humans actually want to get information -- ask a question, hear an answer.

Every product still forcing people to navigate screens and read documentation is living on borrowed time. They are as obsolete as your local smithy that lived and died on producing horseshoes.

I don't think this transition takes ten years. I think it takes five. I think some of you reading this will be building it before the year is out.

## What Savecraft Actually Is

Savecraft is an MCP server -- a protocol that lets AI assistants call tools and get structured data back. You connect it to Claude or ChatGPT, and the AI gets access to your parsed save files alongside reference modules that do real, serious computation. WASPAS multi-criteria scoring with lambda and sigmoid tuning for equipment evaluation. An 8-axis draft pick evaluator trained on 17Lands data. Drop rate calculators that account for your character's actual magic find percentage, not some wiki average. There is genuine math happening behind the curtain to prevent LLM hallucinations, and I'll do a proper technical deep dive on the architecture in a future post, because it deserves one.

But this post isn't about the math. It's about what I did with the results -- no, reader -- it's about what I *didn't* do with the results.

My first instinct was to dashboard it. Of course it was! I'm a software engineer; I've been building dashboards my entire career. I sketched out the character detail page, the equipment comparison view, the draft history timeline. I knew exactly what it would look like -- I could see the nav bar in my mind's eye, every tab lovingly labeled, the whole thing glowing with that particular smugness of a wireframe that hasn't met reality yet.

And then I asked myself: who is this for? The player who wants to know if their equipment is good enough doesn't want to navigate to a comparison screen and puzzle over stat columns. They want to ask "is my gear good enough for Hell difficulty?" and hear "no, and here's specifically why." The draft evaluator data is meaningless as a table -- genuinely, completely meaningless, just numbers in boxes. It becomes valuable when the AI says "you overdrafted red in pack two and it cost you."

![Savecraft reviewing a Magic: The Gathering draft -- 42 picks scored as optimal, good, questionable, or misses, with a color-coded timeline and pick-by-pick analysis](/images/savecraft-draft-review.png)

So, yes, I threw the wireframes away. The reference modules feed the AI, the AI synthesizes the answer, and if the answer needs visual structure, it renders a view inline. The view has no navigation, no state management, no query interface of its own. The moment a view starts doing its own work, you've built a web app in an iframe, competing with established tools that have better UX, years of community goodwill, and no AI subscription requirement. That's not a fight I'd win; but more important it's not even a fight worth having.

They're fighting for the receding scraps of beach as the tide comes in. I want to be the tide.

## "This Sounds Like a Tech Demo"

Your mom sounds like a tech demo.

No, no, seriously -- fair enough! I appreciate your candor. I built this thing -- this conversational gaming companion that synthesizes your actual save data into real, personalized advice -- and I brought it down off the mountain for the gamers. And truly they hated it, because it's AI. Reddit automod removes posts mentioning it. Discord servers ban you for suggesting it. I've been told my product is useless, exploitative, and possibly a sign of civilization's decline, sometimes all in the same Reddit comment. The market is not, shall we say, beating down my door.

But every person who has actually used Savecraft with their own save files has the same reaction, and it's a reaction I've come to recognize with something approaching glee. A brief pause -- the kind where you can almost see the gears turning behind their eyes -- and then a flood of questions they'd never thought to ask a tool before. Not because the tool is magic, but because the conversation doesn't constrain what you can ask. There's no screen to navigate to, no feature to discover, no mental model of the application to build up before you can start getting value. You just... ask. And it just... answers. What a concept!

That reaction is not unique to gaming; anyone who's used these tools seriously has had it. It's what happens when you remove the friction between a user and their information -- any user, any information. The dashboard was never the product. It was the bottleneck. We just dressed it up so handsomely, with such exquisite attention to typography and spacing and hover states, that we forgot to ask whether it belonged there at all.

## Stop Building Dashboards

I could build a Savecraft dashboard tomorrow! Character browser, save file manager, equipment viewer, stat tracker -- every other gaming tool has one, and it would be perfectly straightforward. I even started speccing it out, sketching wireframes like a good little product developer, before I realized I was building furniture for a house where the architecture is the point. What a fool I was.

I'm not going to build it. Every hour I spend on screens is an hour I'm not spending making the AI smarter, and the AI is the thing that makes people's eyes light up when they use it. Not the screens -- never the screens.

If you're building a product right now and you're about to spec out a dashboard, I would humbly ask you to stop for a moment. Is this screen answering a question the user could just ask? Is this nav bar organizing information that an AI could synthesize on demand? Is this settings page configuring something that could be a conversation?

If yes -- and I think you know it's yes, even if admitting it is uncomfortable -- you're building a monument to a dying interaction pattern. A beautiful, well-designed, totally obsolete steaming pile of pre-answered questions.

Build the conversation instead. I promise it's more fun.

---

[Savecraft](https://savecraft.gg) is free and [open source on GitHub](https://github.com/savecraft-gg/savecraft).
