class DecisionTree {
  constructor(classPropertyName, featurePropertyNames, trainingData) {
    this._classPropertyName = classPropertyName;
    this._featurePropertyNames = featurePropertyNames;

    // build the tree from provided training data
    this.decisionTree = this._buildTree(trainingData);
  }

  /**
   * build the decision tree
   * @param rows - array of objects each representing a row of data
   * @returns recursively builds a decision tree
   * @private
   */
  _buildTree(rows) {
    // partition dataset on each of the unique attributes, calculate information gain, return the question that produces highest gain
    const split = this._findBestSplit(rows);

    // no further info gain is possible, return a leaf
    if (split.bestGain === 0) {
      return new Leaf(this._classCounts(rows));
    }

    // a useful feature/value has been found to partition on
    const partition = this._partition(rows, split.bestQuestion);

    // recursively build the true branch
    const trueBranch = this._buildTree(partition.trueRows);

    // recursively build the false branch
    const falseBranch = this._buildTree(partition.falseRows);

    // returns question node of the best feature/value to ask at this point
    // as well as the branches that follow depending on the answer
    return new DecisionNode(split.bestQuestion, trueBranch, falseBranch);
  }

  /**
   * counts the number of each class in a dataset
   * @param rows - array of objects each representing a row of data
   * @returns classCounts - object containing properties named after each class that occurred in the row
   * and a value representing the number of times they occurred
   * @private
   */
  _classCounts(rows) {
    const classCounts = {};
    const classPropertyName = this._classPropertyName;
    rows.forEach(row => {
      const classifier = row[classPropertyName];
      if (!classCounts[classifier]) {
        classCounts[classifier] = 0;
      }
      classCounts[classifier] += 1;
    });
    return classCounts;
  }

  /**
   * partitions a dataset, for each row that passes the question
   * add it to 'trueRows', if it does not pass add it to 'falseRows'
   * @param rows - array of objects each representing a row of data
   * @param question - the question that each row will be checked against
   * @private
   */
  _partition(rows, question) {
    const [trueRows, falseRows] = [[], []];
    rows.forEach(row => {
      if (question.match(row)) {
        trueRows.push(row);
      } else {
        falseRows.push(row);
      }
    });
    return {trueRows, falseRows};
  }

  /**
   * Calculates the gini impurity for a list of rows
   * @param rows - array of objects each representing a row of data
   * @returns impurity - the impurity value of the given set of rows
   * @private
   */
  _gini(rows) {
    const classCounts = this._classCounts(rows);
    let impurity = 1;
    Object.keys(classCounts).forEach(key => {
      const classProbability = classCounts[key] / parseFloat(rows.length);
      impurity -= Math.pow(classProbability, 2);
    });
    return impurity;
  }

  /**
   * Information gain
   * Uncertainty of the starting node, minus the weighted impurity of the two child nodes
   * @param left - rows on the left side of the question (starting node)
   * @param right - rows on the right of the question (starting node)
   * @param current_uncertainty - uncertainty of the starting node
   * @return information gain - the information gain of the left and right split
   * @private
   */
  _infoGain(left, right, current_uncertainty) {
    const weight = left.length / (left.length + right.length);
    return (
      current_uncertainty -
      weight * this._gini(left) -
      (1 - weight) * this._gini(right)
    );
  }

  /**
   * Find best question to ask by iterating over every feature / value
   * and calculating the information gain
   * @param rows - the rows to split on
   * @return split - the best possible split for the given rows
   * @private
   */
  _findBestSplit(rows) {
    let bestGain = 0;
    let bestQuestion = null;
    const current_uncertainty = this._gini(rows);

    this._featurePropertyNames.forEach(column => {
      const uniqueValues = new Set();
      // get all unique values in the column
      rows.forEach(row => {
        uniqueValues.add(row[column]);
      });
      for (let value of uniqueValues) {
        const question = new Question(column, value);
        // split dataset
        const partition = this._partition(rows, question);
        // skip the split if it does not divide the dataset
        if (!partition.trueRows.length || !partition.falseRows.length) {
          continue;
        }

        // information gain from split
        const gain = this._infoGain(
          partition.trueRows,
          partition.falseRows,
          current_uncertainty,
        );
        if (gain >= bestGain) {
          [bestGain, bestQuestion] = [gain, question];
        }
      }
    });
    return {bestGain, bestQuestion};
  }

  /**
   * Recursively prints the tree to the console
   * @param node - leaf or a question
   * @param indent - indentation gap
   * @private
   */
  _printTree(node, indent = '') {
    if (node instanceof Leaf) {
      console.log(
        `${indent}Predict: ${JSON.stringify(node.percentageProbabilities())}`,
      );
      return;
    }

    // print the question at this node
    console.log(`${indent}${node.question.toString()}`);

    // call this function recursively on the true branch
    console.log(`${indent}--> True:`);
    this._printTree(node.trueBranch, indent + '  ');

    // call this function recursively on the false branch
    console.log(`${indent}--> False:`);
    this._printTree(node.falseBranch, indent + '  ');
  }

  _treeToStringArray(node, stringArray, indent = '') {
    if (node instanceof Leaf) {
      stringArray.push(
        `${indent}Predict: ${JSON.stringify(node.percentageProbabilities())}`,
      );
      return stringArray;
    }

    // print the question at this node
    stringArray.push(`${indent}${node.question.toString()}`);

    // call this function recursively on the true branch
    stringArray.push(`${indent}--> True:`);
    this._treeToStringArray(node.trueBranch, stringArray, indent + '      ');

    // call this function recursively on the false branch
    stringArray.push(`${indent}--> False:`);
    this._treeToStringArray(node.falseBranch, stringArray, indent + '      ');
  }

  /**
   * Recursively classifies novel data
   * @param row - the row representing the novel data
   * @param node - current position in the tree
   * @return classification - the predicted class of the novel data
   * @private
   */
  _classify(row, node) {
    if (node instanceof Leaf) {
      return node.percentageProbabilities();
    }
    if (node.question.match(row)) {
      return this._classify(row, node.trueBranch);
    } else {
      return this._classify(row, node.falseBranch);
    }
  }

  /**
   * Public interface for predicting the class of a novel row of data
   * @param row - the novel row of data
   * @return classification - predicted class in format: [{[className]: confidence(%)}]
   * @public
   */
  classify(row) {
    return this._classify(row, this.decisionTree);
  }

  /**
   * Public interface for logging tree to console
   * @public
   */
  printTree() {
    this._printTree(this.decisionTree);
  }

   /**
   * Transforms decision tree into a human readable string
   * @return decision tree in string format with indentation and line breaks
   * @public
   */
  toString() {
    const treeStringArray = [];
    this._treeToStringArray(this.decisionTree, treeStringArray);
    return treeStringArray.reduce((acc, string) => {
      return `${acc} \n ${string}`;
    }, '');
  }
}

/**
 * Questions are used to partition a dataset
 */
class Question {
  /**
   * @param column - property name of the feature value
   * @param value - the value on which to base the question
   */
  constructor(column, value) {
    this.column = column;
    this.value = value;
  }

  /**
   * Compare the feature value in the example to the feature value in this question
   * @param example - row of example data to match on
   * @returns {boolean} - result of the comparison
   */
  match(example) {
    const exampleValue = example[this.column];
    if (isNumeric(exampleValue)) {
      return exampleValue >= this.value;
    } else {
      return exampleValue === this.value;
    }
  }

  /**
   * Formats Question object into a human readable string
   * @return question in string format
   */
  toString() {
    let condition = '==';
    if (isNumeric(this.value)) {
      condition = '>=';
    }
    return `Is ${this.column} ${condition} ${this.value}`;
  }
}

/**
 * Leaf node classifies data
 * Holds the count for the number of times a class reaches this leaf
 */

class Leaf {
  /**
   * @param classCounts - the classes and their frequency at the leaf
   */
  constructor(classCounts) {
    this.predictions = classCounts;
  }

  /**
   * Calculate the probability of possible classifications made by this leaf
   * @return an object containing percentage probabilities of each class at the leaf
   */
  percentageProbabilities() {
    const total = Object.keys(this.predictions).reduce((acc, key) => {
      return acc + this.predictions[key];
    }, 0);
    const probabilities = {};
    Object.keys(this.predictions).forEach(key => {
      probabilities[key] = `${(this.predictions[key] / total) * 100}%`;
    });
    return probabilities;
  }
}

/**
 * Asks a question
 * Holds a reference to the question and the two child nodes
 */
class DecisionNode {
  /**
   * @param question - the question that is asked at this node
   * @param trueBranch - branch to follow if submitted data passes the question
   * @param falseBranch - branch to follow if submitted data fails the question
   */
  constructor(question, trueBranch, falseBranch) {
    this.question = question;
    this.trueBranch = trueBranch;
    this.falseBranch = falseBranch;
  }
}

// Utils

/**
 * Checks a value is numeric
 * @param value - the value to check
 * @return boolean result of the check, true if numeric
 */
function isNumeric(value) {
  return typeof value === 'number';
}

module.exports = DecisionTree;
