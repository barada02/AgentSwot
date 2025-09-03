import type { InfographicData } from '../types';

/**
 * Sample infographic data for testing
 */
export const sampleInfographicHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SWOT Analysis: Sample Business</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        .swot-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 30px;
        }
        .swot-quadrant {
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .swot-quadrant:hover {
            transform: translateY(-5px);
        }
        .strengths {
            background: linear-gradient(135deg, #a8e6cf 0%, #88d8a3 100%);
        }
        .weaknesses {
            background: linear-gradient(135deg, #ffaaa5 0%, #ff8a80 100%);
        }
        .opportunities {
            background: linear-gradient(135deg, #ffd3a5 0%, #fd9853 100%);
        }
        .threats {
            background: linear-gradient(135deg, #a8c8ec 0%, #7fcdff 100%);
        }
        .quadrant-title {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
        }
        .quadrant-content {
            list-style: none;
            padding: 0;
        }
        .quadrant-content li {
            margin-bottom: 10px;
            padding: 8px;
            background: rgba(255,255,255,0.3);
            border-radius: 5px;
            backdrop-filter: blur(10px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 SWOT Analysis: Sample Business</h1>
        
        <div class="swot-grid">
            <div class="swot-quadrant strengths">
                <div class="quadrant-title">💪 Strengths</div>
                <ul class="quadrant-content">
                    <li>Strong brand recognition</li>
                    <li>Experienced team</li>
                    <li>Quality products</li>
                    <li>Customer loyalty</li>
                </ul>
            </div>
            
            <div class="swot-quadrant weaknesses">
                <div class="quadrant-title">⚠️ Weaknesses</div>
                <ul class="quadrant-content">
                    <li>Limited online presence</li>
                    <li>High production costs</li>
                    <li>Small market share</li>
                    <li>Outdated technology</li>
                </ul>
            </div>
            
            <div class="swot-quadrant opportunities">
                <div class="quadrant-title">🌟 Opportunities</div>
                <ul class="quadrant-content">
                    <li>Growing market demand</li>
                    <li>Digital transformation</li>
                    <li>Strategic partnerships</li>
                    <li>International expansion</li>
                </ul>
            </div>
            
            <div class="swot-quadrant threats">
                <div class="quadrant-title">⚡ Threats</div>
                <ul class="quadrant-content">
                    <li>Increasing competition</li>
                    <li>Economic downturn</li>
                    <li>Changing regulations</li>
                    <li>Technology disruption</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>`;

/**
 * Sample text that contains infographic JSON
 */
export const sampleTextWithInfographic = `Based on your business idea, here's a comprehensive SWOT analysis:

\`\`\`json
{
  "contenttype": "infographic",
  "code": "${sampleInfographicHTML.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
}
\`\`\`

This analysis shows that your business has strong potential with several key advantages. The infographic above provides a visual representation of the strategic positioning.`;

/**
 * Creates a sample infographic data object
 */
export const createSampleInfographic = (): InfographicData => ({
  id: `sample-infographic-${Date.now()}`,
  contentType: 'infographic',
  htmlCode: sampleInfographicHTML,
  rawCode: sampleInfographicHTML.replace(/"/g, '\\"').replace(/\n/g, '\\n'),
  partIndex: 0,
});

/**
 * Test function to verify infographic detection and parsing
 */
export const testInfographicParsing = () => {
  console.log('🧪 Testing infographic parsing...');
  
  // Import the utility functions
  import('../utils/messageUtils').then(utils => {
    const { containsInfographicJSON, extractInfographicsFromText } = utils;
    
    console.log('Text contains infographic:', containsInfographicJSON(sampleTextWithInfographic));
    
    const infographics = extractInfographicsFromText(sampleTextWithInfographic, 0);
    console.log('Extracted infographics:', infographics);
    
    if (infographics.length > 0) {
      console.log('✅ Infographic parsing test passed!');
    } else {
      console.log('❌ Infographic parsing test failed!');
    }
  });
};
