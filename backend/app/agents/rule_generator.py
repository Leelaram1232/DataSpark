import asyncio
from typing import Dict, Any, List

class RuleGeneratorAgent:
    """
    Rule Generator Agent – creates IF, LOOP, LOOKUP, CALCULATE logic nodes.
    """
    
    async def generate_logic(self, rules: List[Dict]) -> List[Dict[str, Any]]:
        await asyncio.sleep(1)
        
        # Translates extracted spec rules into explicit visual logic nodes
        logic_nodes = []
        for i, rule in enumerate(rules):
            node_type = rule.get("type", "MAP").upper()
            logic_nodes.append({
                "id": f"node_{i}",
                "type": node_type,
                "label": f"{node_type} Rule",
                "content": rule.get("description", ""),
            })
            
        return logic_nodes
