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

/* base.jinja */
class __TwigTemplate_3dd920acd2c2f9289b0203b7ebbe9c7196d297aac04a3c4b20719f8d56bccb24 extends Template
{
    private $source;
    private $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->parent = false;

        $this->blocks = [
            'content' => [$this, 'block_content'],
        ];
    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 1
        echo "<!DOCTYPE html>
<html>

<head>
  <meta content=\"width=device-width, initial-scale=1.0\" name=\"viewport\">
  <meta content=\"DrugBank Product Concepts Example\" name=\"description\">
  <title>DrugBank Product Concepts Example</title>
  <meta content=\"DrugBank\" name=\"application-name\">

  <script src=\"https://code.jquery.com/jquery-3.4.1.min.js\"
    integrity=\"sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=\" crossorigin=\"anonymous\"></script>

  <link rel=\"stylesheet\" href=\"https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css\"
    integrity=\"sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu\" crossorigin=\"anonymous\">
  <script src=\"https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js\"
    integrity=\"sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd\"
    crossorigin=\"anonymous\"></script>

  <link href=\"https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/css/select2.min.css\" rel=\"stylesheet\" />
  <script src=\"https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/js/select2.min.js\"></script>
  <link href=\"https://cdnjs.cloudflare.com/ajax/libs/select2-bootstrap-theme/0.1.0-beta.10/select2-bootstrap.min.css\"
    rel=\"stylesheet\" />

  <link rel=\"stylesheet\" media=\"all\" href=\"stylesheets/datatables.min.css\">
  <link rel=\"stylesheet\" media=\"all\" href=\"stylesheets/public.css\">
  <link rel=\"stylesheet\" media=\"all\" href=\"stylesheets/nav.css\">

  <script src=\"javascripts/datatables.min.js\"></script>
  <script src=\"javascripts/prism.js\"></script>
  <script src=\"javascripts/shared.js\"></script>
</head>

<body>
  <header>
    <nav class=\"navbar fixed-top navbar-expand-custom navbar-light\" id=\"main-nav\" style=\"background-color: #ff00b8;\">
      <a class=\"navbar-brand\" href=\"/\"><img src=\"images/db-logo-white.svg\" alt=\"Logo white\" height=\"20\"></a>
      <div class=\"collapse navbar-collapse\" id=\"navbar\">
        <ul class=\"navbar-nav ml-auto\">
          <li class=\"nav-item\"><a class=\"nav-link\" href=\"/drug_lookup\">Drug Lookup</a></li>
          <li class=\"nav-item\"><a class=\"nav-link\" href=\"/alternative_drugs\">Alternative Drugs</a></li>
          <li class=\"nav-item\"><a class=\"nav-link\" href=\"/ddi\">Drug-Drug Interactions</a></li>
          <li class=\"nav-item\"><a class=\"nav-link\" href=\"/product_concepts\">Product Concepts</a></li>
          <li class=\"nav-item\"><a class=\"nav-link\" href=\"/indications\">Indications</a></li>
          <li class=\"nav-item\"><a class=\"nav-link\" href=\"/support\">Support</a></li>
        </ul>
      </div>
    </nav>
  </header>
  ";
        // line 49
        $this->displayBlock('content', $context, $blocks);
        // line 50
        echo "</body>

</html>";
    }

    // line 49
    public function block_content($context, array $blocks = [])
    {
        $macros = $this->macros;
    }

    public function getTemplateName()
    {
        return "base.jinja";
    }

    public function getDebugInfo()
    {
        return array (  96 => 49,  90 => 50,  88 => 49,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "base.jinja", "C:\\Users\\keega\\Documents\\Github\\drugbank-sample-apps\\resources\\templates\\base.jinja");
    }
}
