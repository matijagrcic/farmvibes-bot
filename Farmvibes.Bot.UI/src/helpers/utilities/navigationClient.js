import { NavigationClient } from "@azure/msal-browser";

/**
 * This overides the default function MSAL uses to navigate to other urls application
 */
export class CustomNavigationClient extends NavigationClient {
  constructor(navigate) {
    super();
    this.navigate = navigate;
  }

  /**
   * Navigates to other pages within the same web application
   * You can use the useNavigate hook provided by react-router-dom to take advantage of client-side routing
   * @param url
   * @param options
   */
  async navigateInternal(url, options) {
    const relativePath = url.replace(window.location.origin, "");
    if (options.noHistory) {
      /**
       * After logging-in, msal redirects to previous url which was '/admin/login' so this is a temporary override hoping
       * this is the best way to implement
       */
      if (relativePath.includes("login")) this.navigate("/", { replace: true });
      else this.navigate(relativePath, { replace: true });
    } else {
      this.navigate(relativePath);
    }

    return false;
  }
}
