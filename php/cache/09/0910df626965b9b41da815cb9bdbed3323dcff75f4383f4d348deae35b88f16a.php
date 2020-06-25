<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Extension\SandboxExtension;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;

/* product_concepts.jinja */
class __TwigTemplate_60b597a527a75c6fefe3a967d24b31f17d9f3ed3b4829ea7df8028ac98825929 extends Template
{
    private $source;
    private $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->blocks = [
            'content' => [$this, 'block_content'],
        ];
    }

    protected function doGetParent(array $context)
    {
        // line 1
        return "base.jinja";
    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        $macros = $this->macros;
        $this->parent = $this->loadTemplate("base.jinja", "product_concepts.jinja", 1);
        $this->parent->display($context, array_merge($this->blocks, $blocks));
    }

    public function block_content($context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 2
        echo "
<body class=\"c-guides-tutorials a-product_concepts\">
  <main class=\"container-fluid\" role=\"main\">
    <div class=\"help-container main-container\">
      <div class=\"content-container\">
        <div class=\"help-content stretch-content tutorial-content\" id=\"product-concepts-tutorial\">
          <div class=\"content-items\">
            <h3 id=\"select-a-specific-product-code\">Product Concept Search</h3>
            <p>Select a drug, route and strength below to find matching product concepts.</p>
            <div class=\"example-box container-fluid\" id=\"step-4\">
              <div class=\"row\">
                <div class=\"example-col col-sm-4\">
                  <div id=\"loader\"><img src=\"images/pill.gif\" alt=\"Pill\"></div>
                  <div class=\"form-group\">
                    <label for=\"Drug\">Drug</label>
                    <select name=\"drug_search_4\" id=\"drug_search_4\" class=\"drug_autocomplete\" data-url=\"https://dev.drugbankplus.com/guides/tutorials/api_request\" data-step=\"4\"></select>
                  </div>
                  <div class=\"form-group\">
                    <label for=\"Route\">Route</label>
                    <select name=\"route_search_4\" id=\"route_search_4\" class=\"route_autocomplete\" data-url=\"https://dev.drugbankplus.com/guides/tutorials/api_request\" data-step=\"4\"></select>
                  </div>
                  <div class=\"form-group\">
                    <label for=\"Strength\">Strength</label>
                    <select name=\"strength_search_4\" id=\"strength_search_4\" class=\"strength_autocomplete\" data-url=\"https://dev.drugbankplus.com/guides/tutorials/api_request\" data-step=\"4\"></select>
                  </div>
                </div>
                <div class=\"code-col col-sm-8\">
                  <ul class=\"nav nav-pills\" role=\"tablist\">
                    <li class=\"active\" role=\"presentation\"><a data-toggle=\"tab\" href=\"#http-4\" role=\"tab\">Request</a></li>
                    <li role=\"presentation\"><a data-toggle=\"tab\" href=\"#api-4\" role=\"tab\">Response</a></li>
                  </ul>
                  <div class=\"tab-content\">
                    <div class=\"tab-pane active\" id=\"http-4\" role=\"tabpanel\">
                      <div class=\"example-header\">HTTP Request</div>
                      <pre class=\" language-http\"><code class=\" http-request language-http\"></code></pre>
                      <div class=\"example-header\">Shell Command</div>
                      <pre class=\"shell-box language-http\"><code class=\" shell-command language-http\"></code></pre>
                    </div>
                    <div class=\"tab-pane\" id=\"api-4\" role=\"tabpanel\">
                      <div class=\"example-header\">API Response</div>
                      <pre class=\"api-box language-json\"><code class=\" api-response language-json\"></code></pre>
                    </div>
                  </div>
                </div>
              </div>
              <div class=\"row\">
                <div class=\"col-sm-12\">
                  <table class=\"table table-striped products-table\">
                    <thead>
                      <tr role=\"row\">
                        <th>Name</th>
                        <th>Dosage</th>
                        <th>Strength</th>
                        <th>Route</th>
                        <th>Labeller</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <script src=\"javascripts/product_concepts.js\"></script>
</body>

</html>
";
    }

    public function getTemplateName()
    {
        return "product_concepts.jinja";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  49 => 2,  35 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "product_concepts.jinja", "C:\\Users\\keega\\Documents\\Github\\drugbank-sample-apps\\resources\\templates\\product_concepts.jinja");
    }
}
