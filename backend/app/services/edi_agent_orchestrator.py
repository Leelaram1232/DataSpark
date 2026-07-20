from typing import Dict, Any
import logging

from app.agents import (
    SpecificationParserAgent,
    StructureBuilderAgent,
    ITXKnowledgeAgent,
    MappingPlannerAgent,
    RuleGeneratorAgent,
    FunctionalMapGenerator,
    CanvasRendererAgent,
)

logger = logging.getLogger(__name__)

class EDIAgentOrchestrator:
    """
    Orchestrates the 7-agent pipeline to generate an IBM ITX-style integration map.
    """
    
    def __init__(self):
        self.spec_parser = SpecificationParserAgent()
        self.structure_builder = StructureBuilderAgent()
        self.knowledge_agent = ITXKnowledgeAgent()
        self.mapping_planner = MappingPlannerAgent()
        self.rule_generator = RuleGeneratorAgent()
        self.functional_map_generator = FunctionalMapGenerator()
        self.canvas_renderer = CanvasRendererAgent()
        
    async def build_map(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the entire multi-agent pipeline.
        """
        logger.info("Starting AI Map Generation Pipeline...")
        
        # 1. Parse Specification
        # In real life, we would extract the file from the payload
        logger.info("[Agent 1] Parsing Specification...")
        parsed_spec = await self.spec_parser.parse(b"", "spec.pdf")
        extracted_rules = parsed_spec.get("extracted_rules", [])
        
        # 2. Query ITX Knowledge base (RAG)
        logger.info("[Agent 2] Querying ITX Knowledge Base...")
        knowledge = await self.knowledge_agent.query("How to map these rules in ITX?")
        
        # 3. Build Source & Target Structures
        logger.info("[Agent 3] Building Hierarchical Structures...")
        source_standard = payload.get("sourceFormat", "ANSI_X12")
        target_standard = payload.get("targetFormat", "XML")
        
        source_tree_res = await self.structure_builder.build_structure(source_standard, payload.get("sourceTransactionSet", "850"))
        target_tree_res = await self.structure_builder.build_structure(target_standard, payload.get("targetTransactionSet", "Invoice"))
        
        # 4. Plan the Mapping Strategy
        logger.info("[Agent 4] Planning Mapping Strategy...")
        mapping_plan = await self.mapping_planner.plan_mapping(
            source_tree_res["tree"], 
            target_tree_res["tree"], 
            extracted_rules
        )
        
        # 5. Generate Logic Nodes (IF, LOOP, CALCULATE, etc.)
        logger.info("[Agent 5] Generating Logic Nodes...")
        logic_nodes = await self.rule_generator.generate_logic(extracted_rules)
        
        # 6. Generate Functional Maps
        logger.info("[Agent 6] Generating Functional Maps...")
        functional_maps = await self.functional_map_generator.generate_maps(mapping_plan)
        
        # 7. Render Canvas Coordinates
        logger.info("[Agent 7] Rendering Canvas Geometry...")
        canvas_data = await self.canvas_renderer.render_canvas(logic_nodes)
        
        logger.info("AI Map Generation Pipeline Complete.")
        
        # Return the aggregated state to the frontend
        return {
            "status": "success",
            "message": "AI successfully generated mapping.",
            "data": {
                "source_tree": source_tree_res["tree"],
                "target_tree": target_tree_res["tree"],
                "functional_maps": functional_maps,
                "canvas": canvas_data,
                "spec_references": parsed_spec.get("spec_references", {}),
                "ai_explanation": {
                    "summary": "This map converts 310 Freight Receipt and Invoice to EDIFACT Invoice based on the provided specification.",
                    "conditions": [rule["description"] for rule in extracted_rules if rule["type"] == "condition"],
                    "functions": ["IF", "MAP", "CALCULATE", "SUM (for totals)"],
                }
            }
        }
