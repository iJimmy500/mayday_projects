export default {
  javascript: `async function stalinSort(array) {
  let i = 0;
  while (i < array.length - 1) {
    if (array[i] > array[i + 1]) {
      array.splice(i + 1, 1);
    } else {
      i++;
    }
  }
}`,
  python: `def stalin_sort(arr):
    if not arr: return []
    res = [arr[0]]
    for i in range(1, len(arr)):
        if arr[i] >= res[-1]:
            res.append(arr[i])
    return res`,
  c: `// This requires a dynamic array or linked list
void stalinSort(List* list) {
    Node* curr = list->head;
    while (curr && curr->next) {
        if (curr->data > curr->next->data) {
            deleteNode(list, curr->next);
        } else {
            curr = curr->next;
        }
    }
}`,
  java: `public void stalinSort(List<Integer> list) {
    for (int i = 0; i < list.size() - 1; ) {
        if (list.get(i) > list.get(i + 1)) {
            list.remove(i + 1);
        } else {
            i++;
        }
    }
}`,
  lines: null
};
