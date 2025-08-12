Feature: Homepage
  As a visitor
  I want to see the landing page
  So that I know the app is running

  Scenario: Landing page renders hero text
    Given I open the app
    Then I should see text "SubjectAI"
