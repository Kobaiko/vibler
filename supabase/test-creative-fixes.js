const testCreativeGeneration = async () => {
  console.log("🧪 Testing Creative Generation with Clean Background Images...
");

  const testPayload = {
    prompt: "Create professional ads for TechCorp targeting CEOs",
    platforms: ["linkedin"],
    tone: "professional",
    targetAudience: "CEOs",
    productService: "Enterprise software solutions",
    includeVisuals: true,
    imageGenerationType: "ai",
    uploadedImages: [],
    brandSettings: {
      brandName: "TechCorp",
      description: "Enterprise software solutions for modern businesses",
      industry: "technology",
      primaryColor: "#2563eb",
      secondaryColor: "#1d4ed8",
      keywords: ["enterprise", "software", "solutions"]
    },
    icpInsights: {
      painPoints: ["Inefficient processes", "High costs"],
      goals: ["Streamline operations", "Reduce expenses"],
      preferredChannels: ["LinkedIn", "Email"]
    },
    campaignContext: "Focus on ROI and efficiency"
  };

  try {
    console.log("📤 Sending request to generate creative...");
    const response = await fetch("http://localhost:3006/api/creatives/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    console.log("✅ Creative generation successful!");
    
    if (data.creatives && data.creatives.length > 0) {
      const creative = data.creatives[0];
      
      console.log("
📋 Creative Details:");
      console.log(`- Platform: ${creative.platform}`);
      console.log(`- Headline: ${creative.headline}`);
      console.log(`- Description: ${creative.description}`);
      console.log(`- Call to Action: ${creative.call_to_action}`);
      console.log(`- Has Image: ${!!creative.image_url}`);
      console.log(`- Has Composition: ${!!creative.composition}`);
      
      if (creative.composition) {
        console.log("
🎨 Composition Details:");
        console.log(`- Base Image: ${!!creative.composition.baseImage}`);
        console.log(`- Final Composition: ${!!creative.composition.finalComposition}`);
        console.log(`- Number of Layers: ${creative.composition.layers?.length || 0}`);
        console.log(`- Dimensions: ${creative.composition.dimensions?.width}x${creative.composition.dimensions?.height}`);
        
        if (creative.composition.layers) {
          console.log("
📝 Text Layers:");
          creative.composition.layers.forEach((layer, index) => {
            console.log(`  ${index + 1}. ${layer.type}: \"${layer.content}\"`);
          });
        }
      }
      
      // Test if background image is clean (no text)
      if (creative.composition?.baseImage === creative.composition?.finalComposition) {
        console.log("
✅ SUCCESS: Background image is clean (no text overlays)");
      } else {
        console.log("
❌ ISSUE: Background image might have text overlays");
      }
      
    } else {
      console.log("❌ No creatives returned");
    }

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

testCreativeGeneration();
