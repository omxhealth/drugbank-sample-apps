package com.db.app;

import com.hubspot.jinjava.*;

import spark.ModelAndView;
import spark.TemplateEngine;
import spark.Spark.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.Map;

/**
 * Jinjava as Spark TemplateEngine.
 * Taken from https://github.com/n-at/spark-with-jinjava
 */	
public class JinjavaEngine extends TemplateEngine {

    String templatesPath = null;

    Jinjava renderer = null;
    JinjavaConfig rendererConfig = null;

    TemplateLocator locator = null;

    ///////////////////////////////////////////////////////////////////////////

    public JinjavaEngine() {
        this("templates");
    }

    public JinjavaEngine(String templatesPath) {
        this.templatesPath = Paths.get(templatesPath)
                .toAbsolutePath().toString();
        configure();
    }

    @Override
    public String render(ModelAndView modelAndView) {
        try {
            String template = locator.getString(modelAndView.getViewName(),
                    StandardCharsets.UTF_8, null);
            return renderer.render(template, (Map<String, ?>)modelAndView.getModel());
        } catch(IOException e) {
            throw new IllegalArgumentException(e);
        }
    }

    /**
     * Setup renderer
     */
    protected void configure() {
        if (rendererConfig == null) {
            renderer = new Jinjava();
            rendererConfig = renderer.getGlobalConfig();
        } else {
            renderer = new Jinjava(rendererConfig);
        }

        locator = new TemplateLocator(templatesPath);
        renderer.setResourceLocator(locator);
    }

    ///////////////////////////////////////////////////////////////////////////

    /**
     * Set renderer config
     * @param config JinjavaConfig
     */
    public void setConfig(JinjavaConfig config) {
        rendererConfig = config;
        renderer = new Jinjava(rendererConfig);
        renderer.setResourceLocator(locator);
    }

    /**
     * Get renderer configuration
     * @return JinjavaConfig
     */
    public JinjavaConfig getConfig() {
        return rendererConfig;
    }

    public boolean isUseCache() {
        return locator.isUseCache();
    }

    public void setUseCache(boolean useCache) {
        locator.setUseCache(useCache);
    }

}
