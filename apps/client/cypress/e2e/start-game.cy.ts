describe("start game", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("redirects guests to sign in before starting", () => {
    cy.contains("开启Earthworm").click();
    cy.url().should("include", "/callback");
  });

  it("navigates to the game scene and shows course for logged-in users", () => {
    cy.login({
      phone: "13812345678",
      password: "yourPassword",
    });

    cy.intercept("POST", "/game/start", {
      statusCode: 200,
      body: {
        cId: 2,
      },
    }).as("fetchGameStart");

    cy.intercept("GET", "/courses/2", {
      statusCode: 200,
      body: {
        id: "2",
        title: "第二课",
        statements: [
          {
            chinese: "我",
            english: "I",
            id: 30725,
            soundmark: "/aɪ/",
          },
        ],
      },
    }).as("getCourse");

    cy.contains("开启Earthworm").click(); // 点击 Get Started 按钮
    cy.wait("@fetchGameStart"); // 等待拦截的请求
    cy.wait("@getCourse"); // 等待拦截的请求

    cy.url().should("include", "/main/2");
  });
});
