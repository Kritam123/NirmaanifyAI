import { Injectable } from '@nestjs/common';
import {
  PriorityFeatureItem,
  DevelopmentRuleItem,
  MasterProductFlowNode,
} from '@nirmaanify/types';
import { GovernanceRulesEngine } from '@nirmaanify/component-registry';

@Injectable()
export class GovernanceService {
  getPriorityMatrix(): PriorityFeatureItem[] {
    return GovernanceRulesEngine.getPriorityMatrix();
  }

  getDevelopmentRules(): DevelopmentRuleItem[] {
    return GovernanceRulesEngine.getDevelopmentRules();
  }

  getMasterProductFlow(): MasterProductFlowNode[] {
    return GovernanceRulesEngine.getMasterProductFlow();
  }
}
