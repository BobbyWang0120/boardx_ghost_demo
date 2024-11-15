const fs = require('fs');

// Output file path
const OUTPUT_FILE = 'content/sample_posts.json';

// Check if file exists and delete it
if (fs.existsSync(OUTPUT_FILE)) {
    console.log('Found existing sample_posts.json, deleting...');
    fs.unlinkSync(OUTPUT_FILE);
}

// Define available tags
const tags = [
    { id: 'tag-1', name: 'Technology', slug: 'technology' },
    { id: 'tag-2', name: 'Design', slug: 'design' },
    { id: 'tag-3', name: 'Development', slug: 'development' },
    { id: 'tag-4', name: 'AI', slug: 'artificial-intelligence' },
    { id: 'tag-5', name: 'Startup', slug: 'startup' },
    { id: 'tag-6', name: 'Product', slug: 'product' },
    { id: 'tag-7', name: 'UX', slug: 'user-experience' },
    { id: 'tag-8', name: 'Web3', slug: 'web3' },
    { id: 'tag-9', name: 'Career', slug: 'career' },
    { id: 'tag-10', name: 'Innovation', slug: 'innovation' }
];

// Generate random paragraphs
function generateParagraph() {
    const sentences = [
        "In today's rapidly evolving digital landscape, technology continues to reshape how we live and work.",
        "Innovation isn't just about new technologies; it's about solving real-world problems in creative ways.",
        "The intersection of design and technology is creating unprecedented opportunities for businesses.",
        "Data-driven decision making has become essential in modern business strategy.",
        "User experience remains at the heart of successful digital products.",
        "Artificial intelligence is revolutionizing industries in ways we never imagined possible.",
        "The future of work is being redefined by remote collaboration and digital tools.",
        "Blockchain technology is disrupting traditional business models and creating new possibilities.",
        "Sustainable technology practices are becoming increasingly important in software development.",
        "The rise of machine learning is transforming how we approach problem-solving.",
        "Cloud computing has fundamentally changed how businesses operate and scale.",
        "Digital transformation is no longer optional; it's a necessity for survival.",
        "The importance of cybersecurity cannot be overstated in our connected world.",
        "Agile methodologies are evolving to meet the demands of modern development teams.",
        "The power of open-source collaboration is driving innovation across industries."
    ];
    
    const paragraphLength = Math.floor(Math.random() * 5) + 3; // 3-7 sentences
    let paragraph = [];
    
    for (let i = 0; i < paragraphLength; i++) {
        paragraph.push(sentences[Math.floor(Math.random() * sentences.length)]);
    }
    
    return paragraph.join(' ');
}

// Generate post content
function generatePost(index) {
    const titles = [
        "The Future of Technology Innovation",
        "Understanding Design Systems",
        "AI's Impact on Modern Business",
        "Building Successful Startups",
        "Product Management Best Practices",
        "The Evolution of Remote Work",
        "Data-Driven Decision Making",
        "Mastering User Experience Design",
        "Web3 and the Future of the Internet",
        "Cloud Computing Strategies",
        "Digital Transformation Journey",
        "The Rise of Machine Learning",
        "Cybersecurity Best Practices",
        "Agile Development in 2023",
        "Innovation in Tech Industry"
    ];

    // Generate 2-4 paragraphs
    const paragraphCount = Math.floor(Math.random() * 3) + 2;
    const paragraphs = [];
    for (let i = 0; i < paragraphCount; i++) {
        paragraphs.push(generateParagraph());
    }

    // Randomly select 2-4 tags
    const postTags = [];
    const tagCount = Math.floor(Math.random() * 3) + 2;
    const shuffledTags = [...tags].sort(() => Math.random() - 0.5);
    for (let i = 0; i < tagCount; i++) {
        postTags.push(shuffledTags[i]);
    }

    const title = titles[Math.floor(Math.random() * titles.length)] + (index > 9 ? ` ${index + 1}` : '');
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Create featured image URL
    const featuredImage = `https://picsum.photos/seed/${slug}/1200/800`;

    return {
        id: `post-${index + 1}`,
        title: title,
        slug: slug,
        mobiledoc: JSON.stringify({
            version: "0.3.1",
            atoms: [],
            cards: [],
            markups: [],
            sections: paragraphs.map(p => [1, "p", [[0, [], 0, p]]])
        }),
        status: "published",
        feature_image: featuredImage,
        featured: Math.random() > 0.8, // 20% chance of being featured
        published_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        tags: postTags,
        author_id: "1",
        excerpt: paragraphs[0].substring(0, 160) + "..."
    };
}

// Generate Ghost import format data
const ghostData = {
    db: [{
        meta: {
            exported_on: Date.now(),
            version: "5.0.0"
        },
        data: {
            posts: Array.from({ length: 20 }, (_, i) => generatePost(i)),
            tags: tags
        }
    }]
};

// Write to file
try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(ghostData, null, 2));
    console.log(`Generation complete! File saved as ${OUTPUT_FILE}`);
} catch (error) {
    console.error('Error writing file:', error);
}
