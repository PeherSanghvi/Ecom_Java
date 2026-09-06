package com.ecomapi.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

@Repository
public class ProductRepositoryImpl implements ProductRepositoryCustom {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public List<Map> getCategoriesHierarchyAsync() {
        Aggregation aggregation = newAggregation(
            group("primaryCategory")
                .first("primaryCategory").as("name")
                .addToSet("subCategory").as("subCategories")
        );

        AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, "products", Map.class);
        return results.getMappedResults();
    }
}
