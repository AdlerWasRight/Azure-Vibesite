export interface Community {
    id: string; // e.g., '/prj/'
    name: string;
    description: string;
}

export const communities: Community[] = [
    {
        id: '/prj/',
        name: 'Project Hub',
        description: 'Hatch project hub – link files, post milestones, share status updates and deadlines.',
    },
    {
        id: '/std/',
        name: 'Daily Check-in',
        description: 'Daily Hatch check-in: yesterday’s wins, today’s goals, and any blockers.',
    },
    {
        id: '/evt/',
        name: 'World News (Tech)',
        description: 'World news discussion — all things tech.',
    },
    {
        id: '/dmp/',
        name: 'Ideation Dump',
        description: 'Hatch ideation dump – freeform concept-sharing and rapid riffing on new features.',
    },
    {
        id: '/tls/',
        name: 'Toolbox',
        description: 'Hatch toolbox – discuss software, scripts, automations and vote on workflow optimizations.',
    },
    {
        id: '/tut/',
        name: 'Knowledge Base',
        description: 'Hatch knowledge base – drop updated docs, style guides, templates, how-tos and FAQs.',
    },
    {
        id: '/dsk/',
        name: 'Peer Support',
        description: 'Hatch peer support – post questions, tag subject-matter experts, mark as resolved.',
    },
    {
        id: '/ot/',
        name: 'Lounge (Off-Topic)',
        description: 'Hatch lounge – off-topic memes, quick polls, non-work chatter to keep the team’s energy up.',
    },
    // Add a testing category
    {
        id: '/test/',
        name: 'Testing',
        description: 'Community for testing purposes.',
    },
    // Add a default/general category if needed
    {
        id: '/gen/',
        name: 'General Discussion',
        description: 'General discussion topics that don\'t fit other communities.',
    },
];

export const defaultCommunityId = '/gen/'; // Define a default
