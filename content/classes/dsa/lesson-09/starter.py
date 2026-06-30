# Binary Search Trees — smaller goes left, bigger goes right.
#
# A node is [value, left, right]; an empty tree is None. Both are recursive.
# Tip: leave each "pass" until you replace it with your code.


def insert(tree, value):
    # Base case: empty tree -> [value, None, None].
    # Otherwise unpack node_val, left, right and rebuild, inserting into the
    # left branch if value is smaller, the right branch if bigger.
    pass


def search(tree, value):
    # Base case: None -> False. Otherwise compare to the node value and follow
    # the left branch (smaller) or right branch (bigger) with search().
    pass


print("Press Run to grow your tree and watch the search path on the Canvas!")
