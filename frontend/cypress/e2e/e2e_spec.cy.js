describe('JustInTime MRP End-to-End Journeys', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Journey 1: Log in as Floor Manager and check machine status', () => {
    cy.get('input[placeholder*="username"]').type('floormanager');
    cy.get('input[placeholder*="password"]').type('Floor@1234');
    cy.get('button').contains('Sign In').click();
    cy.url().should('include', '/floor-manager');
    cy.get('h1').contains('Machine Status Dashboard');
  });

  it('Journey 2: Log in as Stamper and toggle material confirmation', () => {
    cy.get('input[placeholder*="username"]').type('stamper01');
    cy.get('input[placeholder*="password"]').type('Stamp@1234');
    cy.get('button').contains('Sign In').click();
    cy.url().should('include', '/stamper');
    cy.get('button').contains('Mark as Ready').first().click();
    cy.get('button').contains('Confirmed Ready').should('exist');
  });

  it('Journey 3: Log in as Product Operative and check inventory replenish', () => {
    cy.get('input[placeholder*="username"]').type('prodop01');
    cy.get('input[placeholder*="password"]').type('ProdOp@1234');
    cy.get('button').contains('Sign In').click();
    cy.url().should('include', '/production-operative');
    cy.get('button').contains('Trigger Purchase Order (PO)').first().click();
    cy.get('div').contains('Successfully triggered purchase order').should('exist');
  });
});
