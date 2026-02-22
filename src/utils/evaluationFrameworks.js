export const EVALUATION_FRAMEWORKS = {
  COLD_CALL: {
    name: "Cold Call Framework",
    categories: [
      {
        name: "Opener",
        criteria: [
          "Permission based opener?",
          "Used research on prospect?"
        ]
      },
      {
        name: "Social Proof",
        criteria: [
          "Provided social proof?",
          "Asked if social proof was relevant?"
        ]
      },
      {
        name: "Discovery",
        criteria: [
          "SDR asked for preconceptions of product?"
        ]
      },
      {
        name: "Takeaway",
        criteria: [
          "Re-confirmed that the time works for the prospect?",
          "Asked for success criteria for next call?"
        ]
      },
      {
        name: "Closing",
        criteria: [
          "Next steps agreed upon?",
          "Follow-up meeting booked?"
        ]
      }
    ]
  },

  SPIN: {
    name: "SPIN Selling",
    description: "Situation, Problem, Implication, Need-Payoff",
    categories: [
      {
        name: "Situation Questions",
        criteria: [
          "Asked about current situation/context?",
          "Gathered background information?",
          "Understood existing processes?"
        ]
      },
      {
        name: "Problem Questions",
        criteria: [
          "Identified specific problems/challenges?",
          "Explored pain points in depth?",
          "Got prospect to articulate difficulties?"
        ]
      },
      {
        name: "Implication Questions",
        criteria: [
          "Explored consequences of the problem?",
          "Discussed impact on business/team?",
          "Built urgency around solving the issue?"
        ]
      },
      {
        name: "Need-Payoff Questions",
        criteria: [
          "Asked about value of solving the problem?",
          "Got prospect to describe ideal outcome?",
          "Linked solution to business impact?"
        ]
      }
    ]
  },

  MEDDIC: {
    name: "MEDDIC",
    description: "Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion",
    categories: [
      {
        name: "Metrics",
        criteria: [
          "Identified quantifiable business metrics?",
          "Discussed ROI or cost savings?",
          "Established measurable success criteria?"
        ]
      },
      {
        name: "Economic Buyer",
        criteria: [
          "Identified the economic buyer?",
          "Understood budget authority?",
          "Confirmed ability to make financial decisions?"
        ]
      },
      {
        name: "Decision Criteria",
        criteria: [
          "Uncovered evaluation criteria?",
          "Understood what matters most in selection?",
          "Identified competing priorities?"
        ]
      },
      {
        name: "Decision Process",
        criteria: [
          "Mapped out the buying process?",
          "Identified timeline and steps?",
          "Understood stakeholders involved?"
        ]
      },
      {
        name: "Identify Pain",
        criteria: [
          "Discovered compelling pain points?",
          "Quantified impact of current situation?",
          "Created urgency to change?"
        ]
      },
      {
        name: "Champion",
        criteria: [
          "Identified internal champion?",
          "Built relationship with advocate?",
          "Confirmed champion's influence?"
        ]
      }
    ]
  },

  MEDDPICC: {
    name: "MEDDPICC",
    description: "Metrics, Economic Buyer, Decision Criteria, Decision Process, Paper Process, Identify Pain, Champion, Competition",
    categories: [
      {
        name: "Metrics",
        criteria: [
          "Identified quantifiable business metrics?",
          "Discussed ROI or cost savings?",
          "Established measurable success criteria?"
        ]
      },
      {
        name: "Economic Buyer",
        criteria: [
          "Identified the economic buyer?",
          "Understood budget authority?",
          "Confirmed ability to make financial decisions?"
        ]
      },
      {
        name: "Decision Criteria",
        criteria: [
          "Uncovered evaluation criteria?",
          "Understood what matters most in selection?",
          "Identified competing priorities?"
        ]
      },
      {
        name: "Decision Process",
        criteria: [
          "Mapped out the buying process?",
          "Identified timeline and steps?",
          "Understood stakeholders involved?"
        ]
      },
      {
        name: "Paper Process",
        criteria: [
          "Understood contracting/legal process?",
          "Identified approval requirements?",
          "Discussed procurement procedures?"
        ]
      },
      {
        name: "Identify Pain",
        criteria: [
          "Discovered compelling pain points?",
          "Quantified impact of current situation?",
          "Created urgency to change?"
        ]
      },
      {
        name: "Champion",
        criteria: [
          "Identified internal champion?",
          "Built relationship with advocate?",
          "Confirmed champion's influence?"
        ]
      },
      {
        name: "Competition",
        criteria: [
          "Identified competitive alternatives?",
          "Understood competitive landscape?",
          "Positioned against competition?"
        ]
      }
    ]
  },

  BANT: {
    name: "BANT",
    description: "Budget, Authority, Need, Timeline",
    categories: [
      {
        name: "Budget",
        criteria: [
          "Discussed available budget?",
          "Understood financial constraints?",
          "Confirmed funding allocation?"
        ]
      },
      {
        name: "Authority",
        criteria: [
          "Identified decision maker(s)?",
          "Understood approval process?",
          "Confirmed stakeholder involvement?"
        ]
      },
      {
        name: "Need",
        criteria: [
          "Identified business need?",
          "Understood pain points?",
          "Confirmed problem severity?"
        ]
      },
      {
        name: "Timeline",
        criteria: [
          "Established buying timeline?",
          "Identified key dates/milestones?",
          "Understood urgency?"
        ]
      }
    ]
  },

  CHAMP: {
    name: "CHAMP",
    description: "Challenges, Authority, Money, Prioritization",
    categories: [
      {
        name: "Challenges",
        criteria: [
          "Identified key challenges?",
          "Explored impact of problems?",
          "Understood business implications?"
        ]
      },
      {
        name: "Authority",
        criteria: [
          "Identified decision maker(s)?",
          "Understood approval process?",
          "Mapped stakeholder influence?"
        ]
      },
      {
        name: "Money",
        criteria: [
          "Discussed budget availability?",
          "Understood ROI expectations?",
          "Confirmed financial viability?"
        ]
      },
      {
        name: "Prioritization",
        criteria: [
          "Understood priority level?",
          "Identified competing initiatives?",
          "Confirmed timeline urgency?"
        ]
      }
    ]
  }
};

export const getFramework = (frameworkKey) => {
  return EVALUATION_FRAMEWORKS[frameworkKey] || EVALUATION_FRAMEWORKS.COLD_CALL;
};

export const getFrameworksList = () => {
  return Object.entries(EVALUATION_FRAMEWORKS).map(([key, framework]) => ({
    key,
    name: framework.name,
    description: framework.description
  }));
};
