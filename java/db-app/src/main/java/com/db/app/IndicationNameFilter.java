package com.db.app;

import com.hubspot.jinjava.interpret.JinjavaInterpreter;

public class IndicationNameFilter implements com.hubspot.jinjava.lib.filter.Filter {
    
    @Override
    public Object filter(Object var, JinjavaInterpreter i, String... args) {
        String asString = var.toString();
        asString = asString.toLowerCase();
        asString = asString.replace(" ", "_");
        return asString;
    }

    @Override
    public String getName() {
        return "indication_option";
    }

}
