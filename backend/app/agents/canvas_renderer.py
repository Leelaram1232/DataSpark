import asyncio
from typing import Dict, Any, List

class CanvasRendererAgent:
    """
    Canvas Renderer – formats the generated rules and logic nodes into the JSON structure expected by React Flow or custom LogicCanvas.
    """
    
    async def render_canvas(self, logic_nodes: List[Dict]) -> Dict[str, Any]:
        await asyncio.sleep(1)
        
        rendered_nodes = []
        y_offset = 50
        
        for node in logic_nodes:
            rendered_nodes.append({
                "id": node["id"],
                "type": node["type"],
                "label": node["label"],
                "content": node["content"],
                "position": {"x": 300, "y": y_offset}
            })
            y_offset += 150
            
        return {
            "nodes": rendered_nodes,
            "edges": [
                {"id": "e1", "source": "node_0", "target": "node_1"}
            ]
        }
