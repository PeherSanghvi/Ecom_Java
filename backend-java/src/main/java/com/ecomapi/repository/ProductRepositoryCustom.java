package com.ecomapi.repository;

import java.util.List;
import java.util.Map;

public interface ProductRepositoryCustom {
    List<Map> getCategoriesHierarchyAsync();
}
