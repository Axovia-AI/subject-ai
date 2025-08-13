Feature: Pricing subscription flow
  As a visitor
  I want to start checkout from the pricing page
  So that I can upgrade my plan

  Background:
    Given I mock POST "/functions/v1/create-checkout" to return 200 with JSON {"url":"https://checkout.stripe.com/test"}

  Scenario: Clicking Upgrade triggers checkout creation
    Given I open the app
    # Home contains the pricing section; click any visible CTA that starts checkout
    When I navigate to "/"
    And I click the "Get Started" button
    Then a request should have been made to "/functions/v1/create-checkout"
