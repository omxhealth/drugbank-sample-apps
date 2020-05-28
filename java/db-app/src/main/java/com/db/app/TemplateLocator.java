package com.db.app;

import com.hubspot.jinjava.interpret.JinjavaInterpreter;
import com.hubspot.jinjava.loader.ResourceLocator;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * TemplateLocator and loader for Jinjava (with basic memory cache).
 * Taken from https://github.com/n-at/spark-with-jinjava
 */
public class TemplateLocator implements ResourceLocator {

    String path = "";

    boolean useCache = true;
    Map<String, String> templateCache = new HashMap<>();

    ///////////////////////////////////////////////////////////////////////////

    public TemplateLocator(String path) {
        this.path = path;
    }

    @Override
    public String getString(String fileName, Charset charset, JinjavaInterpreter jinjavaInterpreter)
            throws IOException
    {
        if(useCache) {
            String template = templateCache.get(fileName);
            if(template != null) {
                return template;
            }
        }

        Path templatePath = Paths.get(path, fileName).toAbsolutePath();
        String convertedContent = new String(Files.readAllBytes(templatePath), charset);

        if(useCache) {
            templateCache.put(fileName, convertedContent);
        }

        return convertedContent;
    }

    ///////////////////////////////////////////////////////////////////////////


    public boolean isUseCache() {
        return useCache;
    }

    public void setUseCache(boolean useCache) {
        this.useCache = useCache;
        if(!useCache) {
            templateCache = new HashMap<>();
        }
    }

    public String getPath() {
        return path;
    }
}
