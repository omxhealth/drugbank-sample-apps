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

/* support.jinja */
class __TwigTemplate_5b333ed66a6d76455bdee4048bf82e0d50051160484baafaacdf37ef310876aa extends Template
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
        $this->parent = $this->loadTemplate("base.jinja", "support.jinja", 1);
        $this->parent->display($context, array_merge($this->blocks, $blocks));
    }

    public function block_content($context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 2
        echo "
<body>
  <main class=\"container-fluid\" role=\"main\">
  <div class=\"help-container main-container\">
    <div class=\"content-container\">
      <div class=\"content-items\">
        <h1>Support</h1>
        <h3>External Links</h3>
        <p>For assistance with using the API, please refer to the DrugBank
          <a href=\"https://dev.drugbankplus.com/guides/api\">help center</a>.
        </p>
        <p>Relevant Topics:</p>
          <ul>
            <li>
              <a href=\"https://docs.drugbankplus.com/v1/#drug-names-autocomplete\">Drug Names / Autocomplete</a>
            </li>
            <li>
              <a href=\"https://docs.drugbankplus.com/v1/#product-concepts\">Product Concepts</a>
            </li>
            <li>
              <a href=\"https://docs.drugbankplus.com/v1/#drug-drug-interactions\">Drug-Drug Interactions</a>
            </li>
            <li>
              <a href=\"https://docs.drugbankplus.com/v1/#indications\">Indications</a>
            </li>
          </ul>
        <p>Online versions of some examples can be found 
          <a href=\"https://dev.drugbankplus.com/guides/tutorials/index\">here</a>.
        </p> 
        <p>Still unsure about something? Contact our 
          <a href=\"https://www.drugbankplus.com/contact/support?ref=dev.drugbankplus.com%2Fguides%2Findex\">support team</a> 
          for additional help with our data and products.
        </p> 
        
        <div>

          <h3>Settings</h3>

          <div class=\"row\">
            <form class=\"form-horizontal\" id=\"region_form>
              <div class=\"form-group\">
                <label class=\"control-label col-sm-2\" for=\"region_select\">Region</label>
                <div class=\"col-sm-3\">
                  <select class=\"form-control\" id=\"region_select\">
                    <option value=\"\">All</option>
                    <option value=\"us\">United States</option>
                    <option value=\"ca\">Canada</option>
                    <option value=\"eu\">Europe</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          <br>

          <form class=\"form-horizontal\" id=\"auth_key_form\" action=\"#\" accept-charset=\"UTF-8\" method=\"post\">
            <div class=\"form-group\">
              <label class=\"control-label col-sm-2\" for=\"auth_key_input\">API Key</label>
              <div class=\"col-sm-7\">
                <div class=\"input-group\">
                  <input type=\"text\" class=\"form-control\" id=\"auth_key_input\">
                  <span class=\"input-group-btn\">
                    <button type=\"submit\" class=\"btn btn-primary\" id=\"auth_key_submit\">Update</button>
                  </span>
                </div>
              </div>
            </div>
          </form>

          <div id=\"auth_key_alert\" class=\"alert alert-warning alert-dismissible\" style=\"display: none;\" role=\"alert\">
            <p id=\"auth_update_message\"></p>
            <button type=\"button\" class=\"close\" data-hide=\"alert\" aria-label=\"Close\">
              <span aria-hidden=\"true\">&times;</span>
            </button>
          </div>
        
        </div>
      </div>
    </div>
  </div>
  </main>
  <script src=\"javascripts/support.js\"></script>
</body>

";
    }

    public function getTemplateName()
    {
        return "support.jinja";
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
        return new Source("", "support.jinja", "C:\\Users\\keega\\Documents\\Github\\drugbank-sample-apps\\resources\\templates\\support.jinja");
    }
}
